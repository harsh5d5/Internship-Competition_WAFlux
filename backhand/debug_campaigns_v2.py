
from database import db
from models import User
from main import get_campaigns
import pprint

# Find all campaigns and their owners
print("--- All Campaigns ---")
campaigns = list(db.campaigns.find())
for c in campaigns:
    print(f"Name: {c.get('name')}, Owner: {c.get('owner_email')}")

# If we have owners, test get_campaigns for each unique owner
owners = list(set([c.get('owner_email') for c in campaigns if c.get('owner_email')]))

class MockUser(User):
    pass

for email in owners:
    print(f"\nTesting for user: {email}")
    # Get user details to mock properly (password/etc needed for User model validation?)
    # User model: 
    # class User(BaseModel):
    #     username: str
    #     email: Optional[str] = None
    #     full_name: Optional[str] = None
    #     disabled: Optional[bool] = None
    #     hashed_password: str
    
    user_doc = db.users.find_one({"email": email})
    if not user_doc:
        print(f"User {email} not found in users collection, skipping.")
        continue
        
    current_user = MockUser(**user_doc)
    
    try:
        print("Calling get_campaigns...")
        res = get_campaigns(current_user=current_user)
        print("✅ Success!")
        print(f"Retrieved {len(res)} campaigns.")
    except Exception as e:
        print(f"❌ FAILED for {email}:")
        print(e)
        import traceback
        traceback.print_exc()
