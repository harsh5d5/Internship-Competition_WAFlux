import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get URI from environment variable or use the default
uri = os.getenv("MONGODB_URI", "mongodb+srv://vicky3213v_db_user:vickky123@cluster0.uspmpyh.mongodb.net/?appName=Cluster0")

try:
    # Create a new client and connect to the server with a 1.5-second timeout
    client = MongoClient(uri, server_api=ServerApi('1'), serverSelectionTimeoutMS=1500)
    # Test connection
    client.admin.command('ping')
    db = client.whatsapp_dashboard_db
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"[WARNING] Could not connect to primary MongoDB ({e}). Falling back to local in-memory database (mongomock).")
    import mongomock
    client = mongomock.MongoClient()
    db = client.whatsapp_dashboard_db

def test_connection():
    try:
        client.admin.command('ping')
        print("Pinged deployment/mock database successfully!")
        return True
    except Exception as e:
        print("Connection failed:", e)
        return False

if __name__ == "__main__":
    test_connection()
