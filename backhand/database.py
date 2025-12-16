from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://vicky3213v_db_user:vickky123@cluster0.uspmpyh.mongodb.net/?appName=Cluster0"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

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
