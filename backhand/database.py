import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get URI from environment variable or use the default
uri = os.getenv("MONGODB_URI", "mongodb+srv://vicky3213v_db_user:vickky123@cluster0.uspmpyh.mongodb.net/?appName=Cluster0")

# Create a new client and connect to the server with a 5-second timeout
client = MongoClient(uri, server_api=ServerApi('1'), serverSelectionTimeoutMS=5000)

# Define the database
db = client.whatsapp_dashboard_db

def test_connection():
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
        return True
    except Exception as e:
        print("Connection failed:", e)
        return False

if __name__ == "__main__":
    test_connection()
