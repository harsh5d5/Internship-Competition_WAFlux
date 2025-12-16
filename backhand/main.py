from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class Contact(BaseModel):
    id: str
    name: str
    company: str
    value: str  # Deal value e.g. "$500"
    status: str # 'new', 'interested', 'negotiating', 'closed'
    last_contact: str

class Campaign(BaseModel):
    id: Optional[str] = None
    name: str
    status: str = "Scheduled" # 'Scheduled', 'Completed', 'Active', 'Draft'
    type: str # 'Marketing', 'Update', 'Automation'
    scheduled_date: str
    
    # A/B Testing Fields
    is_ab_test: bool = False
    variant_a_body: Optional[str] = None
    variant_b_body: Optional[str] = None
    split_ratio: int = 50 # Percentage for Variant A (e.g., 50 means 50/50)
    
    # Stats (Mock for now)
    sent: int = 0
    delivered: int = 0
    read: int = 0
    replied: int = 0

# --- Mock Database ---
# Pre-populating some data so the user sees something immediately
contacts_db: List[Contact] = [
    Contact(id="1", name="Alice Smith", company="Tech Corp", value="$1,200", status="new", last_contact="2h ago"),
    Contact(id="2", name="Bob Jones", company="Design Studio", value="$3,500", status="interested", last_contact="1d ago"),
    Contact(id="3", name="Charlie Day", company="Solar Energy", value="$800", status="negotiating", last_contact="3d ago"),
    Contact(id="4", name="Diana Prince", company="Finance Inc", value="$5,000", status="closed", last_contact="1w ago"),
    Contact(id="5", name="Evan Wright", company="Logistics Co", value="$2,100", status="new", last_contact="5h ago"),
]

campaigns_db: List[Campaign] = [
    Campaign(
        id="1", name="Summer Sale Blast", status="Completed", type="Marketing", 
        scheduled_date="Jun 15, 2024", is_ab_test=False, 
        sent=1250, delivered=1240, read=980, replied=145
    ),
    Campaign(
        id="2", name="New Feature (A/B)", status="Scheduled", type="Update", 
        scheduled_date="Tomorrow, 10:00 AM", is_ab_test=True, 
        variant_a_body="Check out our new feature! 🚀", 
        variant_b_body="New update is live! See what's inside. 👀",
        split_ratio=50
    )
]

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "WhatsApp Business CRM API is running"}

@app.get("/api/leads", response_model=List[Contact])
def get_leads():
    return contacts_db

class UpdateStatusRequest(BaseModel):
    status: str

@app.put("/api/leads/{lead_id}/status")
def update_lead_status(lead_id: str, request: UpdateStatusRequest):
    for contact in contacts_db:
        if contact.id == lead_id:
            contact.status = request.status
            return contact
    raise HTTPException(status_code=404, detail="Lead not found")

@app.post("/api/leads", response_model=Contact)
def create_lead(lead: Contact):
    lead.id = str(uuid.uuid4())
    contacts_db.append(lead)
    return lead

@app.get("/api/campaigns", response_model=List[Campaign])
def get_campaigns():
    return campaigns_db

@app.post("/api/campaigns", response_model=Campaign)
def create_campaign(campaign: Campaign):
    campaign.id = str(uuid.uuid4())
    # Default stats for new campaign
    campaign.sent = 0
    campaign.delivered = 0
    campaign.read = 0
    campaign.replied = 0
    campaign.status = "Scheduled"
    
    campaigns_db.append(campaign)
    return campaign

# For running with: uvicorn main:app --reload
