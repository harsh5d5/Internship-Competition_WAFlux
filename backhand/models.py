from pydantic import BaseModel
from typing import Optional, List

# --- User Models ---
class User(BaseModel):
    username: str # This will be the email
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Existing Models (Updated for User Ownership) ---
class Contact(BaseModel):
    id: str
    name: str
    company: str
    value: str 
    status: str
    last_contact: str
    # New: Link contact to a user
    owner_email: Optional[str] = None 

class Campaign(BaseModel):
    id: Optional[str] = None
    name: str
    status: str = "Scheduled"
    type: str 
    scheduled_date: str
    is_ab_test: bool = False
    variant_a_body: Optional[str] = None
    variant_b_body: Optional[str] = None
    split_ratio: int = 50
    sent: int = 0
    delivered: int = 0
    read: int = 0
    replied: int = 0
    # New: Link campaign to a user
    owner_email: Optional[str] = None

# --- Chat Models ---
class Message(BaseModel):
    id: str
    sender: str  # 'me' or 'them'
    text: str
    time: str
    status: str = "sent" # sent, delivered, read

class Chat(BaseModel):
    id: str
    name: str # Contact name
    last_message: str
    time: str
    unread: int
    avatar: Optional[str] = None
    messages: List[Message] = []
    owner_email: Optional[str] = None
