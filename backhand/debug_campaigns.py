


from main import get_campaigns
from models import User
from database import db


# Mock User
class MockUser(User):
    pass

# We need the user's email.
# Let's find a user in the DB.
user_data = db.users.find_one()
if not user_data:
    print("No user found in DB")
    exit()

current_user = MockUser(**user_data)
print(f"Testing for user: {current_user.email}")

try:
    print("Calling get_campaigns...")
    # Depends() doesn't work in direct call, we pass argument manually if the function accepts it.
    # But get_campaigns signature is: def get_campaigns(current_user: User = Depends(...))
    # So we can pass current_user directly.
    campaigns = get_campaigns(current_user=current_user)
    print("✅ Success!")
    print(f"Retrieved {len(campaigns)} campaigns.")
    for c in campaigns:
        print(f" - {c.name} (Status: {c.status})")
except Exception as e:
    print("\n❌ FAILED with error:")
    print(e)
    import traceback
    traceback.print_exc()

