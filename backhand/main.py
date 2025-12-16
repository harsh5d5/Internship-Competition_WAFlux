from fastapi import FastAPI, HTTPException, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional
import uuid
from pydantic import BaseModel
from datetime import timedelta
from jose import JWTError, jwt

# Import our new modules
from database import db
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES, 
    SECRET_KEY, 
    ALGORITHM
)
from models import (
    User, UserCreate, UserInDB, Token, TokenData, 
    Contact, Campaign, Chat, Message
)

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Authentication Dependencies ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    # Find user in MongoDB
    user_dict = db.users.find_one({"username": token_data.username})
    if user_dict is None:
        raise credentials_exception
    
    # Convert MongoDB result to Pydantic model (ignoring _id)
    return User(**user_dict)

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# --- Auth Routes ---

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # 1. Find user by email (username field in form)
    user_dict = db.users.find_one({"username": form_data.username})
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Verify password
    if not verify_password(form_data.password, user_dict['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Create Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/signup", response_model=User)
async def create_user(user: UserCreate):
    # Check if user already exists
    if db.users.find_one({"username": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    
    user_db = UserInDB(
        username=user.email,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        disabled=False
    )
    
    # Insert into MongoDB
    db.users.insert_one(user_db.dict())
    
    return user_db

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# --- Application Routes ---

campaigns_db = []

@app.get("/")
def read_root():
    return {"message": "WhatsApp Business CRM API is running with Auth"}

@app.get("/api/leads", response_model=List[Contact])
def get_leads(current_user: User = Depends(get_current_active_user)):
    contacts_cursor = db.contacts.find({"owner_email": current_user.email})
    contacts = list(contacts_cursor)
    
    # Check if we need to seed demo data (if total contacts < 3, just to be safe and helpful)
    # Or specifically check if "Sarah Wilson" is missing.
    existing_names = {c['name'] for c in contacts}
    
    demo_contacts = []
    
    if "Sarah Wilson" not in existing_names:
        demo_contacts.append(Contact(
            id=str(uuid.uuid4()),
            name="Sarah Wilson",
            company="Global Tech",
            role="VP Sales",
            email="sarah@globaltech.com",
            phone="+1 (555) 010-9988",
            value="$45,000",
            status="active",
            last_contact="10:30 AM",
            tags=["vip", "enterprise"],
            notes="Needs a custom contract by Friday.",
            owner_email=current_user.email,
            unread=2,
            messages=[
                Message(id=str(uuid.uuid4()), sender="them", text="Hi, we are interested in the premium plan.", time="Yesterday", status="read"),
                Message(id=str(uuid.uuid4()), sender="me", text="Great! I can send you the brochure.", time="Yesterday", status="read"),
                Message(id=str(uuid.uuid4()), sender="them", text="Please do. Also, is the API included?", time="10:30 AM", status="sent")
            ]
        ))

    if "Dr. Aisha Gupta" not in existing_names:
        demo_contacts.append(Contact(
            id=str(uuid.uuid4()),
            name="Dr. Aisha Gupta",
            company="City Hospital",
            role="Chief Surgeon",
            email="aisha.g@hospital.org",
            phone="+91 98765 43210",
            value="$0",
            status="urgent", # diff status
            last_contact="Just now",
            tags=["medical", "urgent"],
            notes="Inquiring about emergency alert features.",
            owner_email=current_user.email,
            unread=1,
            messages=[
                Message(id=str(uuid.uuid4()), sender="them", text="We have a system outage.", time="Just now", status="sent")
            ]
        ))
        
    if "Rahul Sharma" not in existing_names:
        demo_contacts.append(Contact(
            id=str(uuid.uuid4()),
            name="Rahul Sharma",
            company="Sharma Real Estate",
            role="Broker",
            email="rahulse@properties.com",
            phone="+91 8888 2222 11",
            value="$1.2M",
            status="inactive",
            last_contact="1 week ago",
            tags=["real-estate", "cold"],
            notes="Not interested currently.",
            owner_email=current_user.email,
            messages=[]
        ))

    if demo_contacts:
        for contact in demo_contacts:
            db.contacts.insert_one(contact.dict())
        # Refresh list
        contacts.extend([c.dict() for c in demo_contacts])

    return contacts


class UpdateStatusRequest(BaseModel):
    status: str

@app.put("/api/leads/{lead_id}/status")
def update_lead_status(lead_id: str, request: UpdateStatusRequest, current_user: User = Depends(get_current_active_user)):
    # Find the contact first to ensure ownership
    contact = db.contacts.find_one({"id": lead_id, "owner_email": current_user.email})
    if not contact:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Update status in MongoDB
    db.contacts.update_one(
        {"id": lead_id},
        {"$set": {"status": request.status}}
    )
    
    # Return updated contact
    updated_contact = db.contacts.find_one({"id": lead_id})
    return updated_contact


@app.post("/api/leads", response_model=Contact)
def create_lead(lead: Contact, current_user: User = Depends(get_current_active_user)):
    # Tag lead with owner and ID
    lead.owner_email = current_user.email
    # Create ID if missing
    if not lead.id:
        lead.id = str(uuid.uuid4())
    
    # Ensure messages is empty list if not provided
    if lead.messages is None:
        lead.messages = []
    
    # Insert into MongoDB
    db.contacts.insert_one(lead.dict())
    return lead

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: str, current_user: User = Depends(get_current_active_user)):
    # Find and delete
    result = db.contacts.delete_one({"id": lead_id, "owner_email": current_user.email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found or unauthorized")
    return {"detail": "Lead deleted successfully"}

@app.put("/api/leads/{lead_id}", response_model=Contact)
def update_lead(lead_id: str, lead_update: Contact, current_user: User = Depends(get_current_active_user)):
    # Verify existence
    existing = db.contacts.find_one({"id": lead_id, "owner_email": current_user.email})
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Update fields (exclude ID and owner_email to prevent tampering)
    update_data = lead_update.dict(exclude={"id", "owner_email"}, exclude_unset=True)
    
    db.contacts.update_one(
        {"id": lead_id},
        {"$set": update_data}
    )
    
    # Return updated
    updated_custom = {**existing, **update_data}
    return Contact(**updated_custom)

# --- Message Persistence on Leads ---

# --- Mock Bot Logic ---
import asyncio
import random

async def simulate_reply(lead_id: str, user_message: str, owner_email: str):
    # Simulate typing delay
    await asyncio.sleep(3)
    
    # Simple keyword-based logic
    msg_lower = user_message.lower()
    reply_text = "Interesting. Tell me more."
    
    if any(x in msg_lower for x in ["hi", "hello", "hey"]):
        reply_text = "Hello! Thanks for reaching out. How can I help you today?"
    elif "price" in msg_lower or "cost" in msg_lower:
        reply_text = "Our enterprise plan starts at $99/month. Would you like a quote?"
    elif "demo" in msg_lower:
        reply_text = "Sure, I'm free tomorrow at 2 PM for a demo. Does that work?"
    elif "thank" in msg_lower:
        reply_text = "You're welcome! Let me know if you need anything else."
    elif "yes" in msg_lower:
        reply_text = "Great! I'll send the details shortly."
    else:
        replies = [
            "Could you clarify that?", 
            "I see. Let me check with my team.", 
            "Sounds good.",
            "Can you send me the PDF?"
        ]
        reply_text = random.choice(replies)

    # Create Message Object
    reply_msg = {
        "id": str(uuid.uuid4()),
        "sender": "them",
        "text": reply_text,
        "time": "Just now",
        "status": "sent" # Bot sent it
    }
    
    # 1. Fetch current contact to get unread count safely
    current_contact = db.contacts.find_one({"id": lead_id, "owner_email": owner_email})
    current_unread = current_contact.get("unread", 0) if current_contact else 0
    
    # 2. Update DB
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": owner_email},
        {
            "$push": {"messages": reply_msg},
            "$set": {
                "last_contact": "Just now",
                "unread": current_unread + 1
            }
        }
    )
    print(f"Bot replied to {lead_id}: {reply_text}")


from fastapi import BackgroundTasks

@app.post("/api/leads/{lead_id}/messages", response_model=Message)
def send_lead_message(lead_id: str, message: Message, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_active_user)):
    # Verify ownership
    contact = db.contacts.find_one({"id": lead_id, "owner_email": current_user.email})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Prepare message
    if not message.id:
        message.id = str(uuid.uuid4())
        
    # Update DB with USER message
    db.contacts.update_one(
        {"id": lead_id},
        {
            "$push": {"messages": message.dict()},
            "$set": {
                "last_contact": "Just now", 
            }
        }
    )
    
    # Trigger Bot Reply in Background
    background_tasks.add_task(simulate_reply, lead_id, message.text, current_user.email)

    return message

@app.put("/api/leads/{lead_id}/read")
def mark_lead_read(lead_id: str, current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email},
        {"$set": {"unread": 0}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}


@app.get("/api/campaigns", response_model=List[Campaign])
def get_campaigns(current_user: User = Depends(get_current_active_user)):
    return campaigns_db

@app.post("/api/campaigns", response_model=Campaign)
def create_campaign(campaign: Campaign, current_user: User = Depends(get_current_active_user)):
    campaign.owner_email = current_user.email
    campaign.id = str(uuid.uuid4())
    campaign.sent = 0
    campaign.delivered = 0
    campaign.read = 0
    campaign.replied = 0
    campaign.status = "Scheduled"
    campaigns_db.append(campaign)
    return campaign

# --- Legacy Chat Endpoints (Optional/Deprecated if using Leads as Chats) ---

@app.get("/api/chats", response_model=List[Chat])
def get_chats(current_user: User = Depends(get_current_active_user)):
    chats_cursor = db.chats.find({"owner_email": current_user.email})
    return list(chats_cursor)

@app.post("/api/chats", response_model=Chat)
def create_chat(chat: Chat, current_user: User = Depends(get_current_active_user)):
    chat.owner_email = current_user.email
    if not chat.id:
        chat.id = str(uuid.uuid4())
    db.chats.insert_one(chat.dict())
    return chat
