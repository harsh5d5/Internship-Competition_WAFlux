from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- User Models ---
class User(BaseModel):
    username: str # This will be the email
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    avatar: Optional[str] = None # New field for profile picture

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

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

# --- Chat Models ---
class Attachment(BaseModel):
    type: str # 'image', 'document'
    url: str
    name: str



class Message(BaseModel):
    id: Optional[str] = None
    sender: str  # 'me' or 'them'
    text: Optional[str] = ""
    time: str
    timestamp: Optional[float] = None
    status: str = "sent" # sent, delivered, read
    attachment: Optional[Attachment] = None
    starred: bool = False
    pinned: bool = False
    reactions: List[str] = []
    reply_to: Optional[str] = None # ID of the message being replied to

class WhatsAppConfig(BaseModel):
    phone_number_id: str
    business_account_id: str
    access_token: str
    owner_email: Optional[str] = None

# --- Existing Models (Updated for User Ownership) ---
class Contact(BaseModel):
    id: str
    name: str
    company: str
    role: Optional[str] = "Lead" # Added
    email: Optional[str] = None # Added
    value: str 
    status: str
    last_contact: str
    updated_at: float = 0.0 # Timestamp for sorting
    phone: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = "" # Added
    avatar: Optional[str] = None # Added for profile photo
    
    # Chat features merged into Contact for MVP
    unread: int = 0 # Added
    messages: List[Message] = [] # Added
    
    # New: Link contact to a user
    owner_email: Optional[str] = None 
    current_node_id: Optional[str] = None # Track current position in automation flow
    is_blocked: bool = False
    is_reported: bool = False

class Campaign(BaseModel):
    id: Optional[str] = None
    name: str
    status: str = "Scheduled"
    type: str 
    audience: Optional[str] = "All Contacts"
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
    image_url: Optional[str] = None  # URL for campaign image
    template_id: Optional[str] = None # ID of selected template


# Keeping Chat model for potential future separation, but Contact handles it for now
class Chat(BaseModel):
    id: str
    name: str # Contact name
    last_message: str
    time: str
    unread: int
    avatar: Optional[str] = None
    messages: List[Message] = []
    owner_email: Optional[str] = None

# --- AI Models ---


class Template(BaseModel):
    id: Optional[str] = None
    name: str
    category: str # Marketing, Utility, Authentication
    language: str # en_US, etc.
    status: str = "Pending" # Approved, Pending, Rejected
    body: str
    last_updated: Optional[str] = None
    usage: int = 0
    owner_email: Optional[str] = None

# --- Automation Models ---
class FlowNode(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, float]

class FlowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    animated: Optional[bool] = True

class AutomationFlow(BaseModel):
    id: Optional[str] = None
    name: str
    status: str = "Draft" # Draft, Published
    nodes: List[FlowNode]
    edges: List[FlowEdge]
    owner_email: Optional[str] = None
    last_edited: Optional[float] = None

