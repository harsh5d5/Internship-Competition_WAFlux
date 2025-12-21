from fastapi import FastAPI, HTTPException, Body, Depends, status, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional
import uuid
import shutil
import os
from pydantic import BaseModel
from jose import JWTError, jwt
from datetime import datetime, timedelta
import io
import csv
from fastapi.responses import StreamingResponse

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
    User, UserCreate, UserInDB, Token, TokenData, UserUpdate, PasswordUpdate, 
    Contact, Campaign, Chat, Message, Attachment, WhatsAppConfig, Template,
    AutomationFlow
)
from websocket_manager import manager as ws_manager

app = FastAPI()

@app.get("/health")
def health_check():
    from database import test_connection
    if test_connection():
        return {"status": "healthy", "database": "connected"}
    else:
        return {"status": "unhealthy", "database": "disconnected"}, 503


# Mount the uploads directory to serve files
# Ensure the directory exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Enable CORS for the frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_URL,
    FRONTEND_URL.rstrip("/"), # Remove trailing slash if any
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, allowing all origins is safer for initial testing, we can restrict it later
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

# --- WebSocket Routes ---
# Import and register WebSocket endpoints
from websocket_routes import websocket_endpoint, websocket_status
app.add_api_websocket_route("/ws/{user_id}", websocket_endpoint)

@app.get("/ws/status")
async def get_ws_status(current_user: User = Depends(get_current_active_user)):
    return await websocket_status(current_user)

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

@app.put("/users/me", response_model=User)
async def update_user(update_data: UserUpdate, current_user: User = Depends(get_current_active_user)):
    # Prepare update dict
    updates = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if updates:
        db.users.update_one(
            {"username": current_user.username},
            {"$set": updates}
        )
        # Update local object to return fresh data
        for k, v in updates.items():
            setattr(current_user, k, v)
            
    return current_user

@app.put("/users/me/password")
async def update_password(pass_update: PasswordUpdate, current_user: User = Depends(get_current_active_user)):
    # 1. Verify current password
    user_db = db.users.find_one({"username": current_user.username})
    if not user_db or not verify_password(pass_update.current_password, user_db['hashed_password']):
         raise HTTPException(status_code=400, detail="Incorrect current password")
         
    # 2. Hash new password
    new_hashed_password = get_password_hash(pass_update.new_password)
    
    # 3. Update in DB
    db.users.update_one(
        {"username": current_user.username},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    
    return {"detail": "Password updated successfully"}
    
@app.delete("/users/me")
async def delete_account(current_user: User = Depends(get_current_active_user)):
    # 1. Delete all associated data
    db.contacts.delete_many({"owner_email": current_user.username})
    db.campaigns.delete_many({"owner_email": current_user.username})
    db.automation.delete_many({"owner_email": current_user.username})
    db.whatsapp_config.delete_many({"owner_email": current_user.username})
    db.templates.delete_many({"owner_email": current_user.username})
    
    # 2. Delete user
    db.users.delete_one({"username": current_user.username})
    
    return {"detail": "Account and all associated data deleted successfully"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user)):
    file_location = f"uploads/{file.filename}"
    
    # Check for duplicate names, maybe append UUID if strictly needed, 
    # but for simple MVP, just overwriting or using original name is okay.
    # To be safer let's prepend uuid
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_location = f"uploads/{unique_filename}"
    
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return the URL relative to the server
    return {"url": f"http://localhost:8000/uploads/{unique_filename}", "name": file.filename, "type": file.content_type}

# --- Application Routes ---

# --- Application Routes ---



@app.get("/")
def read_root():
    return {"message": "WhatsApp Business CRM API is running with Auth"}

from datetime import datetime, timedelta
import time # Input time

@app.get("/api/leads", response_model=List[Contact])
def get_leads(current_user: User = Depends(get_current_active_user)):
    contacts_cursor = db.contacts.find({"owner_email": current_user.email}).sort("updated_at", -1)
    contacts = list(contacts_cursor)
    
    # Check if we need to seed demo data
    existing_names = {c['name'] for c in contacts}
    
    demo_contacts = []
    
    # 1. Sergio Ramos (was Sarah Wilson)
    if "Sergio Ramos" not in existing_names and "Sarah Wilson" not in existing_names:
        demo_contacts.append(Contact(
            id=str(uuid.uuid4()),
            name="Sergio Ramos",
            company="Real Madrid",
            role="Captain",
            avatar="/avatars/sergio-ramos.jpg",
            email="sergio@realmadrid.com",
            phone="+34 666 777 888",
            value="$45,000",
            status="active",
            last_contact="10:30 AM",
            tags=["vip", "football"],
            notes="Needs a new contract.",
            owner_email=current_user.email,
            unread=2,
            updated_at=time.time(),
            messages=[
                Message(id=str(uuid.uuid4()), sender="them", text="Hala Madrid!", time="Yesterday", timestamp=time.time() - 86400, status="read"),
                Message(id=str(uuid.uuid4()), sender="me", text="Vamos!", time="Yesterday", timestamp=time.time() - 86400, status="read"),
                Message(id=str(uuid.uuid4()), sender="them", text="See you at training.", time="10:30 AM", timestamp=time.time(), status="sent")
            ]
        ))

    # 2. Mesut Özil (was Dr. Aisha Gupta)
    if "Mesut Özil" not in existing_names and "Dr. Aisha Gupta" not in existing_names:
        demo_contacts.append(Contact(
            id=str(uuid.uuid4()),
            name="Mesut Özil",
            company="Arsenal",
            role="Playmaker",
            avatar="/avatars/mesut-ozil.jpg",
            email="mesut@arsenal.com",
            phone="+44 777 888 999",
            value="$0",
            status="urgent", 
            last_contact="Just now",
            tags=["assist-king", "urgent"],
            notes="Inquiring about transfer.",
            owner_email=current_user.email,
            unread=1,
            updated_at=time.time(),
            messages=[
                Message(id=str(uuid.uuid4()), sender="them", text="Ya Gunners Ya!", time=datetime.now().strftime("%I:%M %p"), timestamp=time.time(), status="sent")
            ]
        ))
        
    if "Rahul Sharma" not in existing_names:
        demo_contacts.append(Contact(
            id=str(uuid.uuid4()),
            name="Rahul Sharma",
            company="Sharma Real Estate",
            role="Broker",
            avatar="/avatars/avatar-3.jpg",
            email="rahulse@properties.com",
            phone="+91 8888 2222 11",
            value="$1.2M",
            status="inactive",
            last_contact="1 week ago",
            tags=["real-estate", "cold"],
            notes="Not interested currently.",
            owner_email=current_user.email,
            updated_at=time.time() - 604800, # 1 week ago
            messages=[]
        ))

    # 4. Test User (for Testing Campaigns)
    if "Test User" not in existing_names:
        demo_contacts.append(Contact(
            id=str(uuid.uuid4()),
            name="Test User",
            company="Test Corp",
            role="Tester",
            avatar="/avatars/avatar-test-user.png", # Custom image
            email="test@example.com",
            phone="+00 123 456 7890",
            value="$0",
            status="active",
            last_contact="Now",
            tags=["Test Group"], # Important tag
            notes="Use this contact for testing campaigns.",
            owner_email=current_user.email,
            updated_at=time.time(),
            messages=[]
        ))

    if demo_contacts:
        for contact in demo_contacts:
            db.contacts.insert_one(contact.dict())
        # Refresh list
        contacts.extend([c.dict() for c in demo_contacts])

    # --- FIX: Rename old contacts and update avatars ---
    for contact in contacts:
        updates = {}
        
        # Rename Sarah Wilson -> Sergio Ramos
        if contact['name'] == "Sarah Wilson":
            updates["name"] = "Sergio Ramos"
            updates["company"] = "Real Madrid"
            updates["role"] = "Captain"
            updates["avatar"] = "/avatars/sergio-ramos.jpg"
            contact['name'] = "Sergio Ramos" # Update local for response
            contact['avatar'] = "/avatars/sergio-ramos.jpg"

        # Rename Dr. Aisha Gupta -> Mesut Özil
        elif contact['name'] == "Dr. Aisha Gupta":
            updates["name"] = "Mesut Özil"
            updates["company"] = "Arsenal"
            updates["role"] = "Playmaker"
            updates["avatar"] = "/avatars/mesut-ozil.jpg"
            contact['name'] = "Mesut Özil"
            contact['avatar'] = "/avatars/mesut-ozil.jpg"
            
        # Ensure correct avatar for existing Sergio Ramos
        elif contact['name'] == "Sergio Ramos":
             updates["avatar"] = "/avatars/sergio-ramos.jpg"
             contact['avatar'] = "/avatars/sergio-ramos.jpg"

        # Ensure correct avatar for existing Mesut Özil
        elif contact['name'] == "Mesut Özil":
             updates["avatar"] = "/avatars/mesut-ozil.jpg"
             contact['avatar'] = "/avatars/mesut-ozil.jpg"
             
        # Ensure correct avatar for Rahul
        elif contact['name'] == "Rahul Sharma":
             updates["avatar"] = "/avatars/avatar-3.jpg"
             contact['avatar'] = "/avatars/avatar-3.jpg"

        # Ensure correct avatar for Test User
        elif contact['name'] == "Test User":
             updates["avatar"] = "/avatars/avatar-test-user.png"
             contact['avatar'] = "/avatars/avatar-test-user.png"

        if updates:
            db.contacts.update_one(
                {"id": contact['id']},
                {"$set": updates}
            )

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
    
    # Initialize updated_at
    lead.updated_at = time.time()
    
    # Ensure messages is empty list if not provided
    if lead.messages is None:
        lead.messages = []
    
    # Insert into MongoDB
    db.contacts.insert_one(lead.dict())
    return lead

@app.get("/api/leads/{lead_id}", response_model=Contact)
def get_lead(lead_id: str, current_user: User = Depends(get_current_active_user)):
    contact = db.contacts.find_one({"id": lead_id, "owner_email": current_user.email})
    if not contact:
        raise HTTPException(status_code=404, detail="Lead not found")
    return contact

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

@app.get("/api/dashboard/activity")
async def get_dashboard_activity(current_user: User = Depends(get_current_active_user)):
    contacts = list(db.contacts.find({"owner_email": current_user.email}))
    activity_feed = []
    
    for contact in contacts:
        # Get messages reversed (assuming last is new, but list might be append-only)
        msgs = contact.get("messages", [])
        
        # We'll take the last 5 messages from each contact to populate the feed
        recent_msgs = msgs[-5:] if msgs else []
        
        for msg in recent_msgs:
            # Determine type
            msg_type = "message"
            if msg.get("sender") == "them":
                msg_type = "reply"
            elif msg.get("status") == "failed":
                msg_type = "failed"
            elif msg.get("status") == "read":
                 msg_type = "read"
            elif msg.get("sender") == "me":
                 msg_type = "campaign_sent" # mimicking the existing UI style
            
            activity_feed.append({
                "id": msg.get("id") or str(uuid.uuid4()),
                "type": msg_type,
                "user": contact.get("name", "Unknown"),
                "contact_id": contact.get("id"),
                "time": msg.get("time", "Recently"),
                "detail": msg.get("text", "")
            })
            
    # Return top 20 latest (reversed naive)
    return activity_feed[::-1][:20]

# --- Message Persistence on Leads ---

# --- Mock Bot Logic ---
import asyncio
import random

async def simulate_reply(lead_id: str, user_message: str, owner_email: str):
    # Simulate typing delay
    await asyncio.sleep(2)
    
    reply_text = "Thank you for your message. We will get back to you shortly."
    
    # Handle attachment or empty text
    if not user_message or user_message.strip() == "":
        replies = [
            "Received the file, thank you.",
            "Thanks for the attachment. I'll review it and get back to you.",
            "Document received. Give me a moment to look at it."
        ]
        reply_text = random.choice(replies)
    else:
        # Simple keyword-based logic (Business Context)
        msg_lower = user_message.lower()
        
        if any(x in msg_lower for x in ["hi", "hello", "hey", "greetings"]):
            reply_text = "Hello! Thanks for reaching out to WBIZZ Business Solutions. How can we assist you today?"
        elif "price" in msg_lower or "cost" in msg_lower or "quote" in msg_lower:
            reply_text = "Our premium enterprise plan starts at $499/month. Would you like us to prepare a formal quotation for your team?"
        elif "demo" in msg_lower or "meeting" in msg_lower or "call" in msg_lower:
            reply_text = "I'd be happy to schedule a demo. We have availability tomorrow at 10 AM or 2 PM. Which works better for you?"
        elif "thank" in msg_lower:
            reply_text = "You're welcome! We look forward to doing business with you."
        elif "interest" in msg_lower or "buy" in msg_lower:
            reply_text = "That's great to hear! I can send over the contract and onboarding details right away."
        elif "document" in msg_lower or "file" in msg_lower or "pdf" in msg_lower:
            reply_text = "Please send the document over, and our legal team will review it."
        else:
            replies = [
                "Could you provide more specific requirements for your project?",
                "I'll need to check with our technical team regarding that specific feature.", 
                "We can certainly accommodate that request. when are you looking to start?",
                "Is there a good time to call you to discuss this in more detail?"
            ]
            reply_text = random.choice(replies)

    current_time = datetime.now().strftime("%I:%M %p")
    current_epoch = time.time()
    # Create Message Object
    reply_msg = {
        "id": str(uuid.uuid4()),
        "sender": "them",
        "text": reply_text,
        "time": current_time,
        "timestamp": current_epoch,
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
                "last_contact": current_time,
                "updated_at": time.time(),
                "unread": current_unread + 1
            }
        }
    )
    print(f"DEBUG: Bot replied to {lead_id} (Owner: {owner_email}): {reply_text}")

async def execute_flow_node(lead_id: str, node: dict, flow: dict, owner_email: str):
    """Executes a single node and recursively moves to the next one if applicable."""
    
    # 1. Update Contact State
    db.contacts.update_one(
        {"id": lead_id, "owner_email": owner_email},
        {"$set": {"current_node_id": node['id']}}
    )

    next_node = None
    
    # --- AI Node Logic ---
    if node['type'] == 'aiNode':
        instruction = node['data'].get('instruction', '')
        try:
            # Get last user message for context
            contact = db.contacts.find_one({"id": lead_id, "owner_email": owner_email})
            last_msg = contact['messages'][-1]['text'] if contact['messages'] else "Hello"
            
            prompt = f"System Instruction: {instruction}\n\nUser Question: {last_msg}"
            # AI Inference
            response = ai_model.generate_content(prompt)
            reply_text = response.text.strip()
            
            reply_msg = {
                "id": str(uuid.uuid4()),
                "sender": "them",
                "text": reply_text,
                "time": datetime.now().strftime("%I:%M %p"),
                "timestamp": time.time(),
                "status": "sent"
            }
            db.contacts.update_one(
                {"id": lead_id, "owner_email": owner_email},
                {"$push": {"messages": reply_msg}, "$inc": {"unread": 1}}
            )
        except Exception as e:
            print(f"Automation AI Error: {e}")
            reply_text = "I'm having trouble thinking right now. Please try again later."
            reply_msg = {
                "id": str(uuid.uuid4()),
                "sender": "them",
                "text": reply_text,
                "time": datetime.now().strftime("%I:%M %p"),
                "timestamp": time.time(),
                "status": "sent"
            }
            db.contacts.update_one(
                {"id": lead_id, "owner_email": owner_email},
                {"$push": {"messages": reply_msg}, "$inc": {"unread": 1}}
            )
        
        # Find next node after AI
        edge = next((e for e in flow['edges'] if e['source'] == node['id']), None)
        if edge:
            next_node = next((n for n in flow['nodes'] if n['id'] == edge['target']), None)

    # --- Delay Node Logic ---
    elif node['type'] == 'delayNode':
        value = int(node['data'].get('value', 1))
        unit = node['data'].get('unit', 'Minutes').lower()
        
        seconds = value * 60 if 'minute' in unit else value * 3600 if 'hour' in unit else value * 86400 if 'day' in unit else value
        
        print(f"Automation: Waiting {seconds}s for node {node['id']}")
        await asyncio.sleep(min(seconds, 300)) # Cap at 5 mins for MVP/Websockets stability
        
        # Find next node after Delay
        edge = next((e for e in flow['edges'] if e['source'] == node['id']), None)
        if edge:
            next_node = next((n for n in flow['nodes'] if n['id'] == edge['target']), None)

    # --- Message Node Logic ---
    elif node['type'] == 'messageNode':
        current_time = datetime.now().strftime("%I:%M %p")
        current_epoch = time.time()
        reply_text = node['data'].get('label', 'No message content')
        reply_msg = {
            "id": str(uuid.uuid4()),
            "sender": "them",
            "text": reply_text,
            "time": current_time,
            "timestamp": current_epoch,
            "status": "sent"
        }
        db.contacts.update_one(
            {"id": lead_id, "owner_email": owner_email},
            {
                "$push": {"messages": reply_msg},
                "$set": {"last_contact": current_time, "updated_at": time.time()},
                "$inc": {"unread": 1}
            }
        )
        # Find next node if it's NOT a condition (conditions wait for user input)
        edge = next((e for e in flow['edges'] if e['source'] == node['id']), None)
        if edge:
            potential_next = next((n for n in flow['nodes'] if n['id'] == edge['target']), None)
            if potential_next:
                if potential_next['type'] == 'conditionNode':
                    # If next is condition, we stop here but update current node to condition to prepare for next input
                    db.contacts.update_one(
                        {"id": lead_id, "owner_email": owner_email},
                        {"$set": {"current_node_id": potential_next['id']}}
                    )
                else:
                    next_node = potential_next

    # --- Attachment Node Logic ---
    elif node['type'] == 'attachmentNode':
        file_url = node['data'].get('label', '')
        current_time = datetime.now().strftime("%I:%M %p")
        current_epoch = time.time()
        reply_msg = {
            "id": str(uuid.uuid4()),
            "sender": "them",
            "text": f"Shared a file: {file_url}",
            "time": current_time,
            "timestamp": current_epoch,
            "status": "sent",
            "attachment": {"url": file_url, "type": "document", "name": "Attachment"}
        }
        db.contacts.update_one(
            {"id": lead_id, "owner_email": owner_email},
            {"$push": {"messages": reply_msg}, "$set": {"last_contact": current_time}, "$inc": {"unread": 1}}
        )
        edge = next((e for e in flow['edges'] if e['source'] == node['id']), None)
        if edge:
            next_node = next((n for n in flow['nodes'] if n['id'] == edge['target']), None)

    # Recursive step if there is an automatic next node
    if next_node:
        return await execute_flow_node(lead_id, next_node, flow, owner_email)

    return True # We executed at least one node, so return True

async def check_automations(lead_id: str, user_text: str, owner_email: str):
    """Checks for triggers or condition matches in published automation flows."""
    print(f"DEBUG: Checking automations for lead {lead_id}, text: '{user_text}'")
    contact = db.contacts.find_one({"id": lead_id, "owner_email": owner_email})
    if not contact: 
        print(f"DEBUG: No contact found for {lead_id}")
        return False
    
    current_node_id = contact.get("current_node_id")
    published_flows = list(db.automation_flows.find({"owner_email": owner_email, "status": "Published"}))
    print(f"DEBUG: Found {len(published_flows)} published flows")
    
    # 1. State-aware check (if already in a flow)
    if current_node_id:
        print(f"DEBUG: Lead is currently at node {current_node_id}")
        for flow in published_flows:
            node = next((n for n in flow['nodes'] if n['id'] == current_node_id), None)
            if node and node['type'] == 'conditionNode':
                condition_text = node['data'].get('condition', '').lower()
                keywords = [k.strip().lower() for k in condition_text.split(',')]
                is_match = any(k in user_text.lower() for k in keywords if k)
                
                print(f"DEBUG: Logic Branch Match: {is_match} (Keywords: {keywords})")
                
                target_handle = 'yes' if is_match else 'no'
                edge = next((e for e in flow['edges'] if e['source'] == current_node_id and e['sourceHandle'] == target_handle), None)
                
                if edge:
                    next_node = next((n for n in flow['nodes'] if n['id'] == edge['target']), None)
                    if next_node:
                        print(f"DEBUG: Moving to next node {next_node['id']} via {target_handle}")
                        # If we moved via 'no' (mismatch) and next is ANOTHER condition, we should really check that condition against the SAME text immediately.
                        # This allows chaining: Policy? No -> Plans? Yes -> Done.
                        if next_node['type'] == 'conditionNode':
                            # Update state effectively "moving" the user to this new node
                             db.contacts.update_one(
                                {"id": lead_id, "owner_email": owner_email},
                                {"$set": {"current_node_id": next_node['id']}}
                            )
                             # Recursively check the SAME user text against this new node
                             # We do this by returning a recursive call to check_automations, but check_automations fetches state from DB.
                             # Since we just updated DB, calling it again is safe (though slightly inefficient, it's robust).
                             return await check_automations(lead_id, user_text, owner_email)
                        
                        return await execute_flow_node(lead_id, next_node, flow, owner_email)
                        
    # 2. Trigger check (Keyword start)
    for flow in published_flows:
        # Find trigger node
        trigger_node = next((n for n in flow['nodes'] if n['type'] == 'triggerNode'), None)
        if trigger_node:
            trigger_keyword = trigger_node['data'].get('label', '').lower()
            original_keyword = trigger_keyword
            if "keyword:" in trigger_keyword:
                trigger_keyword = trigger_keyword.split("keyword:")[1].replace('"', '').replace("'", "").strip()
            
            # Simple substring match for triggers
            if trigger_keyword and trigger_keyword in user_text.lower():
                print(f"DEBUG: Trigger Match found: '{trigger_keyword}' in flow '{flow['name']}'")
                edge = next((e for e in flow['edges'] if e['source'] == trigger_node['id']), None)
                if edge:
                    next_node = next((n for n in flow['nodes'] if n['id'] == edge['target']), None)
                    if next_node:
                        return await execute_flow_node(lead_id, next_node, flow, owner_email)
    
    print(f"DEBUG: No automation match found")
    return False

from fastapi import BackgroundTasks

@app.post("/api/leads/{lead_id}/messages", response_model=Message)
def send_lead_message(lead_id: str, message: Message, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_active_user)):
    # Verify ownership or handle simulator_user
    contact = db.contacts.find_one({"id": lead_id, "owner_email": current_user.email})
    
    if lead_id == "simulator_user" and not contact:
        current_time = datetime.now().strftime("%I:%M %p")
        # Auto-create simulator lead if missing
        new_lead = Contact(
            id="simulator_user",
            name="Simulator User",
            company="Test Lab",
            value="$0",
            status="active",
            last_contact=current_time,
            owner_email=current_user.email,
            messages=[]
        )
        db.contacts.insert_one(new_lead.dict())
        contact = new_lead.dict()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Prepare message ID if missing
    if not message.id:
        message.id = str(uuid.uuid4())
        
    current_time = datetime.now().strftime("%I:%M %p")
    # Prepare message dict with timestamp
    msg_dict = message.dict()
    if not msg_dict.get('timestamp'):
        msg_dict['timestamp'] = time.time()
        
    # Update DB with USER message
    db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.username},
        {
            "$push": {"messages": msg_dict},
            "$set": {
                "last_contact": current_time, 
                "updated_at": time.time()
            }
        }
    )
    
    # Pass message.text explicitly, handle case where text is None (attachment only)
    user_text = message.text if message.text else ""
    
    # --- Step 1 Implementation: The Interceptor ---
    # First, check if this message triggers a Published Automation
    async def process_message_logic():
        # Use .username as it is guaranteed to be the email/ID
        owner_email = current_user.username
        is_automated = await check_automations(lead_id, user_text, owner_email)
        if not is_automated:
            # If no automation matches, fall back to the basic mock bot
            await simulate_reply(lead_id, user_text, owner_email)
            
    background_tasks.add_task(process_message_logic)

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

@app.delete("/api/leads/{lead_id}/messages")
def clear_lead_messages(lead_id: str, current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email},
        {"$set": {"messages": [], "unread": 0, "last_contact": "Cleared"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}
    
@app.post("/api/leads/{lead_id}/block")
def block_lead(lead_id: str, current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email},
        {"$set": {"is_blocked": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}

@app.post("/api/leads/{lead_id}/report")
def report_lead(lead_id: str, current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email},
        {"$set": {"is_reported": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}

@app.delete("/api/leads/{lead_id}/messages/{message_id}")
def delete_message(lead_id: str, message_id: str, current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email},
        {"$pull": {"messages": {"id": message_id}}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}

@app.put("/api/leads/{lead_id}/messages/{message_id}/star")
def star_message(lead_id: str, message_id: str, starred: bool = Body(..., embed=True), current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email, "messages.id": message_id},
        {"$set": {"messages.$.starred": starred}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"status": "success"}

@app.put("/api/leads/{lead_id}/messages/{message_id}/pin")
def pin_message(lead_id: str, message_id: str, pinned: bool = Body(..., embed=True), current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email, "messages.id": message_id},
        {"$set": {"messages.$.pinned": pinned}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"status": "success"}

@app.post("/api/leads/{lead_id}/messages/{message_id}/react")
def react_message(lead_id: str, message_id: str, emoji: str = Body(..., embed=True), current_user: User = Depends(get_current_active_user)):
    result = db.contacts.update_one(
        {"id": lead_id, "owner_email": current_user.email, "messages.id": message_id},
        {"$addToSet": {"messages.$.reactions": emoji}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"status": "success"}



@app.get("/api/campaigns/stats")
def get_campaign_stats(current_user: User = Depends(get_current_active_user)):
    campaigns = list(db.campaigns.find({"owner_email": current_user.email}))
    total_sent = sum(c.get("sent", 0) for c in campaigns)
    scheduled_count = sum(1 for c in campaigns if c.get("status") == "Scheduled")
    
    # Avoid division by zero
    if total_sent > 0:
        total_read = sum(c.get("read", 0) for c in campaigns)
        avg_open_rate = round((total_read / total_sent) * 100, 1)
    else:
        avg_open_rate = 0.0

    return {
        "total_sent": total_sent,
        "avg_open_rate": avg_open_rate,
        "scheduled": scheduled_count
    }

@app.get("/api/campaigns", response_model=List[Campaign])
def get_campaigns(current_user: User = Depends(get_current_active_user)):
    try:
        campaigns_cursor = db.campaigns.find({"owner_email": current_user.email})
        results = []
        for doc in campaigns_cursor:
            try:
                # Remove _id to avoid confusion, though Pydantic usually ignores it
                if "_id" in doc: 
                    del doc["_id"]
                results.append(Campaign(**doc))
            except Exception as e:
                print(f"SKIPPING INVALID CAMPAIGN: {doc.get('id', 'unknown')} - Error: {e}")
                # Optional: Continue or raise? Let's skip bad ones to unblock the UI
                continue
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/api/campaigns", response_model=Campaign)
def create_campaign(campaign: Campaign, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_active_user)):
    campaign.owner_email = current_user.email
    if not campaign.id:
        campaign.id = str(uuid.uuid4())

    # --- CAMPAIGN SENDING LOGIC ---
    # 1. Define Filter
    query = {"owner_email": current_user.email}
    if campaign.audience and campaign.audience != "All Contacts":
        if campaign.audience == "Leads":
            query["$or"] = [{"role": "Lead"}, {"tags": "Lead"}]
        else:
             # Assume Audience Name maps to a Tag (e.g. "VIP", "New")
             query["tags"] = campaign.audience

    # 2. Find Contacts
    contacts = list(db.contacts.find(query))
    sent_count = 0
    current_time = datetime.now().strftime("%I:%M %p")

    # 3. Simulate Sending Messages
    for contact in contacts:
        # Determine Message Body
        body = campaign.variant_a_body
        if campaign.is_ab_test:
            # Simple randomness for demo
            import random
            if random.random() > (campaign.split_ratio / 100):
                body = campaign.variant_b_body
        
        # Create Main Message (Text) or Attachment Message if no text
        if body or campaign.image_url:
            msg_id = str(uuid.uuid4())
            
            # Construct the message object
            msg_data = {
                "id": msg_id,
                "sender": "me",
                "time": current_time,
                "status": "sent"
            }
            
            # Handle Attachment
            if campaign.image_url:
                msg_data["attachment"] = {
                    "type": "image",
                    "url": campaign.image_url,
                    "name": "Campaign Image"
                }
                # If there's text, it becomes the caption? 
                # For simplicity in this model, we'll send text. 
                # If you want text+image in one bubble, attachment needs a caption. 
                # Current Message model: text: Optional[str], attachment: Optional[Attachment]
                # We can use 'text' as caption if attachment exists.
                msg_data["text"] = body if body else ""
            else:
                 msg_data["text"] = body

            current_time = datetime.now().strftime("%I:%M %p")
            # Push to Contact's history
            db.contacts.update_one(
                {"id": contact["id"]},
                {
                    "$push": {"messages": msg_data},
                    "$set": {
                        "last_contact": current_time, 
                        "updated_at": time.time()
                    }
                }
            )
            sent_count += 1
            
            # Background Bot Reply (Simulated)
            if body: # Only reply if there was text? Or always? Let's say if text.
                 # We need to pass this in function sig
                 # Let's add it to signature.
                 pass 

    # Update Campaign Stats
    campaign.sent = sent_count
    campaign.status = "Completed" # Auto-complete for instant send demo

    result = db.campaigns.insert_one(campaign.dict())
    
    return campaign


@app.put("/api/campaigns/{campaign_id}", response_model=Campaign)
def update_campaign(campaign_id: str, campaign_update: Campaign, current_user: User = Depends(get_current_active_user)):
    existing_campaign = db.campaigns.find_one({"id": campaign_id, "owner_email": current_user.email})
    if not existing_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Update fields
    update_data = campaign_update.dict(exclude={"id", "owner_email", "sent", "delivered", "read", "replied"}) # Protect stats and ID
    
    # If status is being changed to "Active" or "Completed" from something else, we might need trigger logic again 
    # But for now, we'll just allow data updates. A re-send logic would be more complex.
    
    db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": update_data}
    )
    
    # Return updated campaign
    return {**existing_campaign, **update_data}

# --- Message Template Routes ---

@app.get("/api/templates", response_model=List[Template])
def get_templates(current_user: User = Depends(get_current_active_user)):
    templates_cursor = db.templates.find({"owner_email": current_user.email})
    templates = list(templates_cursor)
    
    # Seed demo data if none exists
    if not templates:
        demo_templates = [
            Template(
                id=str(uuid.uuid4()),
                name="welcome_offer_2024",
                category="Marketing",
                language="en_US",
                status="Approved",
                body="Hi {{1}}, welcome to WBIZZ! 🚀 Here is an exclusive 20% off coupon for your first month: {{2}}. Expires in 24h.",
                last_updated="2 days ago",
                usage=2400,
                owner_email=current_user.email
            ),
            Template(
                id=str(uuid.uuid4()),
                name="order_confirmation",
                category="Utility",
                language="en_US",
                status="Approved",
                body="Hello {{1}}, your order #{{2}} has been confirmed. We will notify you when it ships. Thanks for shopping with us! 📦",
                last_updated="1 week ago",
                usage=15200,
                owner_email=current_user.email
            ),
             Template(
                id=str(uuid.uuid4()),
                name="appointment_reminder",
                category="Utility",
                language="en_US",
                status="Pending",
                body="Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Please reply YES to confirm.",
                last_updated="5 hours ago",
                usage=0,
                owner_email=current_user.email
            )
        ]
        for t in demo_templates:
            db.templates.insert_one(t.dict())
        return demo_templates
        
    return templates

@app.post("/api/templates", response_model=Template)
def create_template(template: Template, current_user: User = Depends(get_current_active_user)):
    template.owner_email = current_user.email
    if not template.id:
        template.id = str(uuid.uuid4())
    template.last_updated = datetime.now().strftime("%I:%M %p")
    
    db.templates.insert_one(template.dict())
    return template

@app.put("/api/templates/{template_id}", response_model=Template)
def update_template(template_id: str, template_update: Template, current_user: User = Depends(get_current_active_user)):
    existing = db.templates.find_one({"id": template_id, "owner_email": current_user.email})
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")
        
    update_data = template_update.dict(exclude={"id", "owner_email"}, exclude_unset=True)
    update_data["last_updated"] = "Just now"
    
    db.templates.update_one(
        {"id": template_id},
        {"$set": update_data}
    )
    return {**existing, **update_data}

@app.delete("/api/templates/{template_id}")
def delete_template(template_id: str, current_user: User = Depends(get_current_active_user)):
    result = db.templates.delete_one({"id": template_id, "owner_email": current_user.email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"status": "success"}

# --- WhatsApp Configuration Routes ---

@app.post("/api/config/whatsapp", response_model=WhatsAppConfig)
def save_whatsapp_config(config: WhatsAppConfig, current_user: User = Depends(get_current_active_user)):
    config.owner_email = current_user.email
    
    # Upsert: Update if exists, Insert if new
    db.whatsapp_config.update_one(
        {"owner_email": current_user.email},
        {"$set": config.dict()},
        upsert=True
    )
    return config

@app.get("/api/config/whatsapp")
def get_whatsapp_config(current_user: User = Depends(get_current_active_user)):
    config = db.whatsapp_config.find_one({"owner_email": current_user.email})
    if not config:
        return {}
    
    # Mask the token for security
    masked_token = config.get("access_token", "")
    if len(masked_token) > 10:
        masked_token = masked_token[:4] + "*" * (len(masked_token) - 8) + masked_token[-4:]
    else:
        masked_token = "*" * len(masked_token)
        
    return {
        "phone_number_id": config.get("phone_number_id"),
        "business_account_id": config.get("business_account_id"),
        "access_token": masked_token,
        "is_configured": True
    }

# --- Legacy Chat Endpoints (Optional/Deprecated if using Leads as Chats) ---

@app.get("/api/chats", response_model=List[Chat])
def get_chats(current_user: User = Depends(get_current_active_user)):
    chats_cursor = db.chats.find({"owner_email": current_user.email})
    return list(chats_cursor)

@app.get("/api/leads/export")
def export_leads(current_user: User = Depends(get_current_active_user)):
    try:
        print(f"DEBUG: Starting export for user {current_user.email}")
        # 1. Fetch all contacts for this user
        contacts = list(db.contacts.find({"owner_email": current_user.email}))
        print(f"DEBUG: Found {len(contacts)} contacts to export")
        
        # 2. Setup CSV Buffer
        output = io.StringIO()
        writer = csv.writer(output)
        
        # 3. Header
        writer.writerow(["ID", "Name", "Role", "Company", "Phone", "Email", "Status", "Tags", "Last Contact", "Notes"])
        
        # 4. Rows
        for c in contacts:
            # Handle potential None for tags
            tags_list = c.get("tags")
            if tags_list is None:
                tags_list = []
            elif isinstance(tags_list, str):
                tags_list = [tags_list]
                
            writer.writerow([
                c.get("id", ""),
                c.get("name", "Unknown"),
                c.get("role", "Lead"),
                c.get("company", ""),
                c.get("phone", ""),
                c.get("email", ""),
                c.get("status", "New"),
                ",".join(tags_list),
                str(c.get("last_contact", "")), # Ensure string
                c.get("notes", "")
            ])
            
        output.seek(0)
        csv_content = output.getvalue()
        print(f"DEBUG: CSV generated, size {len(csv_content)} bytes")
        
        # Use a generator to stream
        def iterfile():
            yield csv_content

        response = StreamingResponse(
            iterfile(),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=wbizz_leads.csv"
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR in export_leads: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leads/all")
def get_all_leads_for_export(current_user: User = Depends(get_current_active_user)):
    """
    Returns all contacts/leads as JSON for PDF generation on frontend
    """
    try:
        contacts = list(db.contacts.find({"owner_email": current_user.email}))
        
        # Clean up the data for frontend consumption
        cleaned_contacts = []
        for contact in contacts:
            # Remove MongoDB's _id field
            if "_id" in contact:
                del contact["_id"]
            
            # Ensure tags is always a list
            if contact.get("tags") is None:
                contact["tags"] = []
            elif isinstance(contact.get("tags"), str):
                contact["tags"] = [contact["tags"]]
            
            cleaned_contacts.append(contact)
        
        return {
            "contacts": cleaned_contacts,
            "total": len(cleaned_contacts),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"ERROR in get_all_leads_for_export: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chats", response_model=Chat)
def create_chat(chat: Chat, current_user: User = Depends(get_current_active_user)):
    chat.owner_email = current_user.email
    if not chat.id:
        chat.id = str(uuid.uuid4())

    db.chats.insert_one(chat.dict())
    return chat

# --- Automation Flow Routes ---

@app.get("/api/automation", response_model=List[AutomationFlow])
def get_automation_flows(current_user: User = Depends(get_current_active_user)):
    flows = list(db.automation_flows.find({"owner_email": current_user.email}))
    return flows

@app.post("/api/automation", response_model=AutomationFlow)
def save_automation_flow(flow: AutomationFlow, current_user: User = Depends(get_current_active_user)):
    import time
    flow.owner_email = current_user.email
    flow.last_edited = time.time()
    
    # If no ID, check if a flow with this name already exists for this user to avoid duplicates
    existing_flow = None
    if not flow.id:
        existing_flow = db.automation_flows.find_one({"name": flow.name, "owner_email": current_user.email})
    else:
        existing_flow = db.automation_flows.find_one({"id": flow.id, "owner_email": current_user.email})

    if existing_flow:
        # Update existing
        flow.id = existing_flow['id'] # Ensure we keep the same ID
        db.automation_flows.update_one(
            {"id": flow.id},
            {"$set": flow.dict(exclude={"id", "owner_email"})}
        )
    else:
        # Create new
        if not flow.id:
            flow.id = str(uuid.uuid4())
        db.automation_flows.insert_one(flow.dict())
        
    return flow

@app.get("/api/automation/{flow_id}", response_model=AutomationFlow)
def get_automation_flow(flow_id: str, current_user: User = Depends(get_current_active_user)):
    flow = db.automation_flows.find_one({"id": flow_id, "owner_email": current_user.email})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    return flow

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_active_user)):
    owner_email = current_user.username
    leads_count = db.contacts.count_documents({"owner_email": owner_email})
    campaigns_count = db.campaigns.count_documents({"owner_email": owner_email})
    automations_count = db.automation_flows.count_documents({"owner_email": owner_email})
    
    return {
        "leads": leads_count,
        "campaigns": campaigns_count,
        "automations": automations_count,
        "status": "active"
    }

@app.delete("/api/automation/{flow_id}")
def delete_automation_flow(flow_id: str, current_user: User = Depends(get_current_active_user)):
    result = db.automation_flows.delete_one({"id": flow_id, "owner_email": current_user.email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flow not found")
    return {"status": "success"}

# --- AI & Advanced Actions Routes ---
import google.generativeai as genai
from openai import OpenAI

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = None
if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("sk-svcacct"):
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"⚠️ OpenAI initialization failed: {e}")

# Google AI Configuration (Legacy/Fallback)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyBdG9ERty6YWZ_e3VMoGHFSn6woIeGGYOk")
genai.configure(api_key=GOOGLE_API_KEY)
ai_model = genai.GenerativeModel('gemini-pro-latest')

class RewriteRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str
    system_instruction: Optional[str] = None
    history: Optional[List[dict]] = []

import json
import os

@app.post("/api/ai/assistant")
async def ai_assistant(request: ChatRequest, current_user: User = Depends(get_current_active_user)):
    # Local Intelligence Logic (Zero-Cost Fail-safe)
    def get_local_reply(user_msg, leads, campaigns):
        msg = user_msg.lower()
        if "bored" in msg:
            return "Bored? Let's fix that! Did you know WBIZZ can send 1,000 messages in the time it took you to type that? Try creating a 'Surprise Campaign' in the Campaigns tab to see some magic happen!"
        if any(x in msg for x in ["stat", "count", "account", "how many"]):
            return f"Currently, your WBIZZ dashboard shows {leads} leads and {campaigns} active campaigns. Your engagement is looking healthy!"
        if any(x in msg for x in ["campaign", "start", "send"]):
            return "To start a campaign, navigate to the 'Campaigns' tab on the left. You can create a new broadcast, select your audience, and even run A/B tests."
        if any(x in msg for x in ["automation", "flow", "bot"]):
            return "Our Automation Builder allows you to create drag-and-drop flows. You can set triggers based on keywords and even add AI nodes for smart replies."
        return "I'm here to help you dominate your WhatsApp marketing. You can ask me about your stats, how to build automations, or how to launch a campaign!"

    try:
        # Get Stats Safely
        owner_email = getattr(current_user, "username", "unknown")
        try:
            leads_count = db.contacts.count_documents({"owner_email": owner_email})
            campaigns_count = db.campaigns.count_documents({"owner_email": owner_email})
        except:
            leads_count, campaigns_count = 0, 0

        # Load Brain Safely
        kb_text = "{}"
        try:
            brain_path = os.path.join(os.path.dirname(__file__), "wbizz_brain.json")
            if os.path.exists(brain_path):
                with open(brain_path, 'r') as f:
                    kb_text = f.read()
        except:
            pass

        # Try AI Engines
        try:
            prompt = f"Role: WBIZZ AI Expert. Documentation: {kb_text}. User Stats: {leads_count} leads. Question: {request.message}"
            # Try Gemini (Primary)
            response = ai_model.generate_content(prompt)
            return {"response": response.text.strip()}
        except Exception as e:
            print(f"AI API Error: {e}")
            # Final Reliable Fallback (Local Brain)
            reply = get_local_reply(request.message, leads_count, campaigns_count)
            return {"response": reply, "mode": "local"}

    except Exception as global_err:
        print(f"ULTIMATE ASSISTANT FAILSAFE: {global_err}")
        return {"response": "WBIZZ AI is currently in power-save mode. I can tell you that your dashboard is active and ready for campaigns! What can I help you build?"}

@app.post("/api/ai/rewrite")
async def ai_rewrite(request: RewriteRequest, current_user: User = Depends(get_current_active_user)):
    try:
        prompt = f"Rewrite this WhatsApp message to be more professional, persuasive, and friendly. Keep it concise. Return ONLY the rewritten message: {request.text}"
        response = ai_model.generate_content(prompt)
        return {"rewritten_text": response.text.strip()}
    except Exception as e:
        print(f"AI Error: {e}")

@app.post("/api/ai/chat")
async def ai_chat(request: ChatRequest, current_user: User = Depends(get_current_active_user)):
    try:
        prompt = request.message
        if request.system_instruction:
            prompt = f"System Instruction: {request.system_instruction}\n\nUser Question: {request.message}"
        
        response = ai_model.generate_content(prompt)
        return {"response": response.text.strip()}
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="AI service unavailable")

@app.get("/api/leads/export")
async def export_leads(current_user: User = Depends(get_current_active_user)):
    contacts_cursor = db.contacts.find({"owner_email": current_user.username})
    contacts = list(contacts_cursor)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Name", "Company", "Role", "Email", "Phone", "Value", "Status", "Last Contact", "Notes", "Tags"])
    
    # Data
    for c in contacts:
        writer.writerow([
            c.get("name", ""),
            c.get("company", ""),
            c.get("role", ""),
            c.get("email", ""),
            c.get("phone", ""),
            c.get("value", ""),
            c.get("status", ""),
            c.get("last_contact", ""),
            c.get("notes", ""),
            ", ".join(c.get("tags", []))
        ])
    
    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=wbizz_leads.csv"}
    )


