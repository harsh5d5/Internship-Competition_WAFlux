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
    # Fetch contacts owned by the current user from MongoDB
    contacts_cursor = db.contacts.find({"owner_email": current_user.email})
    return list(contacts_cursor)


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
    lead.id = str(uuid.uuid4())
    
    # Insert into MongoDB
    db.contacts.insert_one(lead.dict())
    return lead

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

# --- Chat Endpoints ---

@app.get("/api/chats", response_model=List[Chat])
def get_chats(current_user: User = Depends(get_current_active_user)):
    # Fetch chats owned by the current user
    chats_cursor = db.chats.find({"owner_email": current_user.email})
    return list(chats_cursor)

@app.post("/api/chats", response_model=Chat)
def create_chat(chat: Chat, current_user: User = Depends(get_current_active_user)):
    chat.owner_email = current_user.email
    # Ensure ID is present
    if not chat.id:
        chat.id = str(uuid.uuid4())
    
    db.chats.insert_one(chat.dict())
    return chat

@app.post("/api/chats/{chat_id}/messages", response_model=Message)
def send_message(chat_id: str, message: Message, current_user: User = Depends(get_current_active_user)):
    # Verify ownership of the chat
    chat = db.chats.find_one({"id": chat_id, "owner_email": current_user.email})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Ensure message has ID and timestamp if missing (though frontend should send it)
    if not message.id:
        message.id = str(uuid.uuid4())
    
    # Update the chat document: push message to array and update last_message
    db.chats.update_one(
        {"id": chat_id},
        {
            "$push": {"messages": message.dict()},
            "$set": {
                "last_message": message.text, 
                "time": message.time
            }
        }
    )
    return message
