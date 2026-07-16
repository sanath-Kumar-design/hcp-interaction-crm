from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from models import Interaction
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent import agent, get_hcp_history, get_suggested_followups, schedule_followup, llm
from langchain_core.messages import ToolMessage, AIMessage
from langgraph.errors import GraphRecursionError
from database import engine
from models import Base
import json
from models import FollowUp
from datetime import date, timedelta
from fastapi import HTTPException
from sqlalchemy import func
from schemas import UserSignup, UserLogin
from sqlalchemy.exc import IntegrityError
from models import User
from auth import get_current_user
from dotenv import load_dotenv


load_dotenv()

from auth import (
    hash_password,
    verify_password,
    create_access_token,
)

class ChatRequest(BaseModel):
    message: str
    current_data: dict | None = None

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory state — fine for single-user/dev, not safe for concurrent multi-user prod
pending_clarification = {"awaiting": None}  # e.g. {"awaiting": "history_hcp_name"}


def has_real_data(d: dict | None) -> bool:
    if not d:
        return False
    return any(v not in (None, "", {}, []) for v in d.values())


@app.get("/")
def home():
    return {"message": "Backend is running"}


class InteractionRequest(BaseModel):
    hcp_name: str
    interaction_type: str
    hospital: str = ""
    specialty: str = ""
    date: str = ""
    time: str = ""
    attendees: str = ""
    topics_discussed: str = ""
    materials_shared: str = ""
    samples_distributed: str = ""
    sentiment: str = ""
    outcomes: str = ""
    follow_up: str = ""
    follow_up_date: str = ""
    


@app.post("/interactions")
def create_interaction(
    data: InteractionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    ):
    print("Logged in user:", current_user["user_id"])
    interaction = Interaction(
        user_id=current_user["user_id"],
        hcp_name=data.hcp_name,
        interaction_type=data.interaction_type,
        hospital = data.hospital,
        specialty = data.specialty,
        date=data.date,
        time=data.time,
        attendees=data.attendees,
        topics_discussed=data.topics_discussed,
        materials_shared=data.materials_shared,
        samples_distributed=data.samples_distributed,
        sentiment=data.sentiment,
        outcomes=data.outcomes,
        follow_up=data.follow_up,
        follow_up_date=data.follow_up_date,
    )
    print(interaction)

    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return {"message": "Interaction saved", "id": interaction.id}


@app.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()

        if db.query(User).filter(User.email == user.email).first():
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        if db.query(User).filter(User.username == user.username).first():
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

    return {
        "message": "User created successfully"
    }
    
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": db_user.email,
        "user_id": db_user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
    }

@app.post("/autofill")
def autofill(data: ChatRequest):
    print("Received:", data.message)

    # Handle a pending clarification answer first, before running the agent
    if pending_clarification["awaiting"] == "history_hcp_name":
        pending_clarification["awaiting"] = None
        hcp_name = data.message.strip()

        print("===== HISTORY MODE (clarification answer) =====")

        history_raw = get_hcp_history.invoke({"hcp_name": hcp_name})
        history_data = json.loads(history_raw)

        if not history_data.get("found"):
            return {"result": "{}", "reply": history_data.get("message", "No history found."), "suggestions": []}

        reply_text = f"Here's your last interaction with {history_data['hcp_name']} — form auto-filled ({history_data['total_past_interactions']} total past interactions)."
        return {"result": json.dumps(history_data), "reply": reply_text, "suggestions": []}

    context = ""
    if data.current_data:
        context = f"\n\n(Current form data already entered: {json.dumps(data.current_data)})"

    from datetime import date
    today_str = date.today().isoformat()
    context += f"\n\n(Today's date is {today_str}. Resolve any relative dates like 'next week' or 'in two weeks' against this.)"

    print("2. Calling agent...")

    ACTION_TOOLS = {"log_interaction", "edit_interaction", "get_hcp_history", "schedule_followup"}

    messages = []
    first_tool_result = None   # (tool_name, tool_content)
    pending_history_check = False

    max_attempts = 2
    last_error = None

    for attempt in range(1, max_attempts + 1):
        messages = []
        first_tool_result = None
        pending_history_check = False
        try:
            for step in agent.stream(
                {"messages": [
                    {"role": "system", "content": "Call only the ONE tool that directly matches what the user explicitly asked for. Do not call additional tools (like scheduling follow-ups or checking history) unless the user specifically requested that action."},
                    {"role": "user", "content": data.message + context}
                ]},
                stream_mode="values",
                config={"recursion_limit": 6},
            ):
                messages = step["messages"]
                last = messages[-1]
                preview = str(getattr(last, "content", ""))[:200]
                print(f"  [step] {type(last).__name__}: {preview}")

                # Detect a get_hcp_history call with no name → ask for clarification
                tool_calls = getattr(last, "tool_calls", None)
                if tool_calls:
                    for call in tool_calls:
                        if call.get("name") == "get_hcp_history":
                            hcp_name_arg = (call.get("args", {}) or {}).get("hcp_name", "").strip()
                            if not hcp_name_arg:
                                pending_history_check = True

                # STOP as soon as we get the first real tool result — ignore anything after
                if isinstance(last, ToolMessage) and last.name in ACTION_TOOLS and first_tool_result is None:
                    first_tool_result = (last.name, last.content)
                    print(f"  [stopping early] got result from {last.name}, ignoring further loop steps")
                    break

            last_error = None
            break  # success — exit retry loop

        except GraphRecursionError:
            print("Agent hit recursion limit — likely looping on tool calls")
            if first_tool_result is None:
                return {"result": "{}", "reply": "That got too complex — try rephrasing more simply.", "suggestions": []}
            last_error = None
            break

        except Exception as e:
            last_error = e
            print(f"Agent invocation failed (attempt {attempt}/{max_attempts}):", repr(e))
            if attempt < max_attempts:
                print("  Retrying...")
                continue

    if last_error is not None:
        return {"result": "{}", "reply": "Sorry, I had trouble processing that — could you rephrase or simplify it a bit?", "suggestions": []}

    if pending_history_check and first_tool_result is None:
        pending_clarification["awaiting"] = "history_hcp_name"
        return {"result": "{}", "reply": "Sure — which HCP's history would you like to see?", "suggestions": []}

    if first_tool_result is None:
        final_ai_messages = [m for m in messages if isinstance(m, AIMessage) and m.content]
        reply_text = final_ai_messages[-1].content if final_ai_messages else "Sorry, I couldn't process that."
        return {"result": "{}", "reply": reply_text, "suggestions": []}

    tool_name, result = first_tool_result

    if tool_name == "schedule_followup":
        # Plain confirmation string, not JSON — don't touch the form state
        return {"result": "{}", "reply": result, "suggestions": []}

    if tool_name == "get_hcp_history":
        history_data = json.loads(result)
        if not history_data.get("found"):
            return {"result": "{}", "reply": history_data.get("message", "No history found."), "suggestions": []}
        reply_text = f"Here's your last interaction with {history_data['hcp_name']} — form auto-filled ({history_data['total_past_interactions']} total past interactions)."
        return {"result": result, "reply": reply_text, "suggestions": []}

    # log_interaction / edit_interaction — expect JSON, feed into suggestions
    try:
        json.loads(result)
    except json.JSONDecodeError:
        print(f"Tool {tool_name} returned invalid JSON: {result}")
        return {"result": "{}", "reply": "Sorry, I had trouble structuring that — could you rephrase?", "suggestions": []}

    reply_text = f"Got it — {tool_name.replace('_', ' ')} completed."

    suggestions = []
    try:
        suggestions_raw = get_suggested_followups.invoke({"interaction_summary": result})
        suggestions = json.loads(suggestions_raw)
    except Exception as e:
        print("Suggestions failed:", e)
        suggestions = []

    return {"result": result, "reply": reply_text, "suggestions": suggestions}

@app.get("/history/{hcp_name}")
def get_history(hcp_name: str):
    print(f"Fetching history for: {hcp_name}")
    agent_result = agent.invoke({
        "messages": [{"role": "user", "content": f"Show me the interaction history for {hcp_name}"}]
    })
    for msg in agent_result["messages"]:
        if isinstance(msg, ToolMessage) and msg.name == "get_hcp_history":
            return {"result": msg.content}
    return {"result": "{}"}


@app.get("/followups")
def get_followups(db: Session = Depends(get_db)):
    followups = db.query(FollowUp).order_by(FollowUp.followup_date.asc()).all()
    return [
        {
            "id": f.id,
            "hcp_name": f.hcp_name,
            "followup_date": f.followup_date,
            "notes": f.notes,
            "status": f.status,
        }
        for f in followups
    ]
    
    
@app.get("/kpis")
def get_kpis(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = date.today()
    today_str = today.isoformat()
    thirty_days_ago = (today - timedelta(days=30)).isoformat()
    week_end = (today + timedelta(days=7)).isoformat()

    all_interactions = (
    db.query(Interaction)
    .filter(Interaction.user_id == current_user["user_id"])
    .all()
)

    # Today's visits
    todays_visits = [i for i in all_interactions if i.date == today_str]

    # Pending follow-ups: has a follow_up_date set, and it's today or in the future
    pending_followups = [
        i for i in all_interactions
        if i.follow_up_date and i.follow_up_date >= today_str
    ]
    overdue_followups = [
        i for i in all_interactions
        if i.follow_up_date and i.follow_up_date < today_str
    ]
    due_this_week = [
        i for i in pending_followups
        if i.follow_up_date <= week_end
    ]

    # Positive interactions, last 30 days
    recent = [i for i in all_interactions if i.date >= thirty_days_ago]
    positive_recent = [i for i in recent if i.sentiment == "Positive"]
    positive_pct = round((len(positive_recent) / len(recent)) * 100) if recent else 0

    # Samples distributed this month — counting rows with a non-empty samples field
    this_month_prefix = today_str[:7]  # "2026-07"
    samples_this_month = [
        i for i in all_interactions
        if i.date.startswith(this_month_prefix) and i.samples_distributed
    ]

    return {
        "todaysVisits": {
            "value": len(todays_visits),
            "sub": f"{len(todays_visits)} logged today",
        },
        "pendingFollowups": {
            "value": len(pending_followups),
            "overdue": len(overdue_followups),
            "dueThisWeek": len(due_this_week),
        },
        "positiveInteractions": {
            "value": f"{positive_pct}%",
        },
        "samplesDistributed": {
            "value": len(samples_this_month),
        },
    }
    
@app.get("/interactions/recent")
def get_recent_interactions(limit: int = 5, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    
    interactions = (
        db.query(Interaction)
        .filter(Interaction.user_id == current_user["user_id"])
        .order_by(Interaction.id.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": i.id,
            "hcpName": i.hcp_name,
            "interactionType": i.interaction_type,
            "date": i.date,
            "topics": i.topics_discussed,
        }
        for i in interactions
    ]
    
@app.get("/interactions/upcoming-followups")
def get_upcoming_followups(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today_str = date.today().isoformat()

    interactions = (
        db.query(Interaction)
        .filter(Interaction.user_id == current_user["user_id"])
        .filter(Interaction.follow_up_date != None)
        .filter(Interaction.follow_up_date != "")
        .filter(Interaction.follow_up_date >= today_str)
        .order_by(Interaction.follow_up_date.asc())
        .limit(3)
        .all()
    )

    return [
        {
            "id": i.id,
            "hcpName": i.hcp_name,
            "followUp": i.follow_up,
            "followUpDate": i.follow_up_date,
        }
        for i in interactions
    ]
    
from datetime import date, timedelta

@app.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    thirty_days_ago = (today - timedelta(days=30)).isoformat()

    recent = (
        db.query(Interaction)
        .filter(Interaction.user_id == current_user["user_id"])
        .filter(Interaction.date >= thirty_days_ago)
        .order_by(Interaction.date.desc())
        .limit(15)
        .all()
    )

    if not recent:
        return {"recommendations": []}

    summary_lines = []
    for i in recent:
        summary_lines.append(
            f"- {i.hcp_name} ({i.specialty}, {i.hospital}): {i.date}, "
            f"sentiment={i.sentiment}, outcomes=\"{i.outcomes}\", "
            f"follow_up=\"{i.follow_up}\", follow_up_date={i.follow_up_date or 'none'}"
        )
    data_summary = "\n".join(summary_lines)

    prompt = f"""
You are a CRM assistant for a pharma sales rep. Based on these recent HCP interactions,
suggest 2-4 short, specific, actionable recommendations for what the rep should prioritize next.

Recent interactions:
{data_summary}

Today's date is {today.isoformat()}.

Rules:
1. Prioritize interactions with positive sentiment and an upcoming or overdue follow-up date.
2. Flag any HCP who seems to need attention soon based on the data given.
3. Each recommendation must be one sentence, specific, and reference the HCP by name.
4. Do NOT invent HCPs, dates, or details not present in the data above.
5. Return ONLY a valid JSON array of strings, e.g. ["Dr. Chen showed strong interest — send the efficacy report before Jul 21."]
6. Do NOT use markdown. Do NOT wrap in ``` or explain your answer.
"""

    response = llm.invoke(prompt)

    try:
        recommendations = json.loads(response.content.strip())
    except json.JSONDecodeError:
        recommendations = []

    return {"recommendations": recommendations}


@app.get("/hcps")
def get_hcps(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    ):
    rows = (
    db.query(
        func.min(Interaction.hcp_name).label("hcpName"),
        Interaction.hospital,
        Interaction.specialty,
        func.max(Interaction.sentiment).label("sentiment"),
    )
    .filter(Interaction.user_id == current_user["user_id"])
    .group_by(
        func.lower(Interaction.hcp_name),
        Interaction.hospital,
        Interaction.specialty,
    )
    .all()
    )
    return [
        {
            "hcpName": r.hcpName,
            "hospital": r.hospital,
            "specialty": r.specialty,
            "sentiment": r.sentiment,
        }
        for r in rows
    ]
@app.get("/hcps/{hcp_name}")
def get_hcp_detail(hcp_name: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    interactions = (
        db.query(Interaction)
        .filter(func.lower(Interaction.hcp_name) == hcp_name.lower())
        .filter(Interaction.user_id == current_user["user_id"])
        .order_by(Interaction.date.desc())
        .all()
    )

    if not interactions:
        raise HTTPException(status_code=404, detail="HCP not found")

    latest = interactions[0]

    return {
        "hcpName": latest.hcp_name,
        "hospital": latest.hospital,
        "sentiment": latest.sentiment,
        "specialty": latest.specialty,
        "interactionCount": len(interactions),
        "interactions": [
            {
                "id": i.id,
                "date": i.date,
                "notes": i.notes,       # adjust fields to match your model
                "type": i.interaction_type,
            }
            for i in interactions
        ],
    }