from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    hcp_name = Column(String(100))
    interaction_type = Column(String(50))
    hospital = Column(String(100))
    specialty = Column(String(50))
    date = Column(String(20))
    time = Column(String(20))

    attendees = Column(Text)
    topics_discussed = Column(Text)
    materials_shared = Column(Text)
    samples_distributed = Column(Text)

    sentiment = Column(String(20))
    outcomes = Column(Text)
    follow_up = Column(Text)
    follow_up_date = Column(String(20))
    
    
class FollowUp(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    hcp_name = Column(String, nullable=False)
    followup_date = Column(String, nullable=False)
    notes = Column(String, default="")
    status = Column(String, default="pending")
    
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)