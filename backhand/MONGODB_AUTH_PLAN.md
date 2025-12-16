# Backend Implementation Plan: Authentication & MongoDB Integration

## 1. Project Goal
Implement secure user authentication (Login/Signup) and connect the FastAPI backend to MongoDB Atlas. Ensure "Messages", "Contacts", and "Chats" are stored persistently and secured.

## 2. Dependencies
We will install the following specific packages:
- `pymongo[srv]==3.12`: For MongoDB connection (User specific version).
- `passlib[bcrypt]`: For secure password hashing.
- `python-jose[cryptography]`: For JWT token generation and verification.
- `python-multipart`: For handling login form data.

**Command:**
```bash
pip install "pymongo[srv]==3.12" passlib[bcrypt] python-jose[cryptography] python-multipart
```

## 3. Database Connection (`database.py`)
We will create a specific module to handle the MongoDB connection using your provided credentials.

**Configuration:**
- **URI:** `mongodb+srv://vicky3213v_db_user:vickky123@cluster0.uspmpyh.mongodb.net/?appName=Cluster0`
- **Code Snippet:**
  ```python
  from pymongo.mongo_client import MongoClient
  from pymongo.server_api import ServerApi

  # Connection URI
  uri = "mongodb+srv://vicky3213v_db_user:vickky123@cluster0.uspmpyh.mongodb.net/?appName=Cluster0"

  # Create a new client and connect to the server
  client = MongoClient(uri, server_api=ServerApi('1'))

  # Database Instance
  db = client.whatsapp_dashboard_db 
  ```

## 4. Workflows & Modules

### A. Authentication Module (`auth.py`)
- **Password Utility**:
  - `verify_password(plain, hashed)`
  - `get_password_hash(password)`
- **Token Utility**:
  - `create_access_token(data, expires_delta)`
  - `get_current_user(token)`: Dependency for protecting routes.

### B. Data Models (`models.py`)
We will define Pydantic models for data validation.
- **User**: `username`, `email`, `full_name`, `disabled`, `hashed_password`
- **Token**: `access_token`, `token_type`
- **Contact/Chat**: Update existing models to include `owner_id` (the user who owns the data).

### C. API Routes (`main.py`)
1. **POST `/token` (Login)**:  Validates credentials and returns a JWT.
2. **POST `/users` (Signup)**: Creates a new user in MongoDB.
3. **GET `/users/me`**: Returns current user profile (Protected).
4. **Update Existing Routes**:
   - `/api/leads`: Modify to fetch from MongoDB `contacts` collection.
   - `/api/campaigns`: Modify to fetch from MongoDB `campaigns` collection.
   - `/api/chats`: Modify to fetch from MongoDB `chats` collection.

## 5. Execution Steps
1.  **Install dependencies** (`pymongo` etc).
2.  **Create `database.py`** with the connection string.
3.  **Create `auth.py`** and `models.py`.
4.  **Update `main.py`** to integrate the database and add Auth routes.
5.  **Test connection** using the provided "ping" snippet.
