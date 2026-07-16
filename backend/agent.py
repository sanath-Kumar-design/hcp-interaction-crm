from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from database import SessionLocal
from models import Interaction
from datetime import datetime

today = datetime.now().strftime("%Y-%m-%d")

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile"
)


@tool
def log_interaction(notes: str) -> str:
    """
    Use this tool when the user provides free-text notes describing an HCP interaction.

    Input:
    - notes: A single string containing the entire interaction.

    Do NOT pass structured fields like hcp_name or sentiment.
    Always pass the complete interaction text as the 'notes' argument.
    """

    prompt = f"""
    
    
    Specialty must be one of:
    - Cardiology
    - Oncology
    - Neurology
    - Endocrinology
    - Pediatrics
    - Psychiatry
    - Dermatology

    Infer the closest matching specialty from the interaction.
    Examples:
    - Cardiologist, heart specialist, cardio → Cardiology
    - Oncologist, cancer specialist → Oncology
    - Neurologist, brain specialist → Neurology

    Always return one of the allowed values.

    Today's date is {today}.

    If the interaction contains relative dates like:
    - today
    - yesterday
    - tomorrow
    - last Monday
    - next Tuesday
    - 2 weeks from now

    resolve them relative to today's date.

    Return the date in YYYY-MM-DD format.
    Return the time in HH:mm (24-hour) format.

    Return ONLY valid JSON.
    Do NOT wrap the response in ``` or ```json.
    
    follow_up: A short description of the next action to take (e.g. "Send efficacy comparison report", "Schedule follow-up demo"). Extract this from what the HCP asked for or what was agreed. Do NOT return "Yes" or "No" — always describe the specific action. If no follow-up was mentions, return an empty string.

    follow_up_date: The date of the follow-up in YYYY-MM-DD format, resolved the same way as the interaction date above (relative to today's date: {today}). If no follow-up date was mentioned, return an empty string.
    
    sentiment: Must be exactly one of: Positive, Neutral, Skeptical, Negative. Choose the closest match based on the HCP's tone in the interaction.
    
    outcomes: A brief summary of how the interaction concluded or the HCP's overall response (e.g. "Interested, requested more info"). If genuinely nothing was conveyed, return an empty string.
    
    samples_distributed: A description of the samples given (e.g. "CardioMed 20mg x5"). Do NOT return "Yes" or "No" — always describe what was given, or return an empty string if no samples were distributed.

    {{
        "hcp_name": "",
        "interaction_type": "",
        "hospital": "",
        "specialty": "",
        "date": "",
        "time": "",
        "attendees": "",
        "topics_discussed": "",
        "materials_shared": "",
        "samples_distributed": "",
        "sentiment": "",
        "outcomes": "",
        "follow_up": "",
        "follow_up_date": "",
    
    }}

    Interaction type must be exactly one of:
    - In Person
    - Phone Call
    - Video Call
    - Conference
    - sEmail

    Do not return any other value.
    Interaction:
    {notes}
    """

    response = llm.invoke(prompt)
    return str(response.content)




@tool
def edit_interaction(current_data: str, instruction: str) -> str:
    """
    Use this tool whenever the user wants to modify an existing HCP interaction.

    Inputs:
    - current_data: JSON string representing the current interaction.
    - instruction: User's correction or update.

    Update ONLY the fields explicitly mentioned by the user.
    Preserve every other field exactly as it is.

    Return ONLY the updated fields as valid JSON.
    """

    prompt = f"""
You are an HCP CRM assistant.

Your task is to update an existing interaction record.

Current interaction JSON:
{current_data}

User instruction:
{instruction}

Rules:
1. Update ONLY the fields explicitly mentioned.
2. Do NOT modify any other fields.
3. Do NOT invent information.
4. Return ONLY valid JSON.
5. Do NOT use markdown.
6. Do NOT wrap the response in ``` or ```json.
7. Do NOT generate Python code.
8. Do NOT explain your answer.
9. If no fields need updating, return {{}}.

Return only the updated fields.
"""

    response = llm.invoke(prompt)

    print(response.content)

    return response.content.strip()

@tool
def get_hcp_history(hcp_name: str) -> str:
    """
    Use this tool whenever the user wants to view previous interactions
    with a specific HCP.
    """
    import json as json_lib
    import re

    def normalize(name: str) -> str:
        # lowercase, strip punctuation, collapse whitespace
        name = name.lower()
        name = re.sub(r"[^\w\s]", "", name)   # remove punctuation like "." 
        name = re.sub(r"\s+", " ", name).strip()
        return name

    target = normalize(hcp_name)

    db = SessionLocal()
    all_interactions = db.query(Interaction).order_by(Interaction.id.desc()).all()
    db.close()

    interactions = [i for i in all_interactions if normalize(i.hcp_name) == target]

    if not interactions:
        return json_lib.dumps({"found": False, "message": f"No interactions found for {hcp_name}"})

    latest = interactions[0]

    result = {
        "found": True,
        "hcp_name": latest.hcp_name,
        "interaction_type": latest.interaction_type,
        "date": latest.date,
        "time": latest.time,
        "attendees": latest.attendees,
        "topics_discussed": latest.topics_discussed,
        "materials_shared": latest.materials_shared,
        "samples_distributed": latest.samples_distributed,
        "sentiment": latest.sentiment,
        "outcomes": latest.outcomes,
        "follow_up": latest.follow_up,
        "total_past_interactions": len(interactions),
    }

    return json_lib.dumps(result)


@tool
def get_suggested_followups(interaction_summary: str) -> str:
    """
    Use this tool to generate AI-suggested follow-up actions based on a completed HCP interaction.

    Input:
    - interaction_summary: A JSON string or text summary of the interaction (topics discussed, outcomes, sentiment).

    Returns a JSON array of 2-4 short, actionable follow-up suggestions.
    """
    prompt = f"""
Based on this HCP interaction, suggest 2-4 concise, actionable follow-up steps a pharma sales rep should take next.

Interaction:
{interaction_summary}

Return ONLY a valid JSON array of short strings, e.g.:
["Schedule follow-up in 2 weeks", "Send efficacy data PDF"]

Do NOT use markdown. Do NOT explain your answer.
"""
    response = llm.invoke(prompt)
    return response.content.strip()


@tool
def schedule_followup(hcp_name: str, followup_date: str, notes: str) -> str:
    """
    Use this tool to schedule a follow-up task/reminder for a specific HCP.

    Input:
    - hcp_name: Name of the HCP.
    - followup_date: Date for the follow-up in YYYY-MM-DD format.
    - notes: Brief context for what the follow-up is about.

    Returns a confirmation string.
    """
    print(">>> schedule_followup tool started")

    from models import FollowUp

    db = SessionLocal()
    try:
        followup = FollowUp(
            hcp_name=hcp_name,
            followup_date=followup_date,
            notes=notes,
        )
        db.add(followup)
        db.commit()
        db.refresh(followup)
        followup_id = followup.id
    finally:
        db.close()

    return f"Follow-up #{followup_id} scheduled for {hcp_name} on {followup_date}. Notes: {notes}"


agent = create_react_agent(
    model=llm,
    tools=[
        log_interaction,
        edit_interaction,
        get_hcp_history,
        get_suggested_followups,
        schedule_followup,
    ],
    prompt="You are a CRM assistant. Call exactly ONE tool that directly matches what the user explicitly asked for, then stop. Never call schedule_followup, get_hcp_history, or get_suggested_followups unless the user's message specifically asks for that action. Do not chain multiple tool calls in a single turn.",
)