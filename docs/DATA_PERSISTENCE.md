# User Data Persistence & Isolation Implementation Guide

This guide outlines the architecture and steps required to ensure that every user sees only their own data and that data is preserved reliably across sessions.

## Phase 1: Backend Database & Models

1.  **Define the User Model:**
    *   Create a `User` collection in MongoDB to store credentials (email, hashed password).
    *   Ensure emails are unique indexes to prevent duplicate accounts.

2.  **Update Data Models (Contacts, Campaigns, etc.):**
    *   Modify every data model (e.g., `Contact`, `Campaign`, `Message`) to include an ownership field.
    *   **Field Name:** `owner_email` (or `user_id`).
    *   **Type:** String/ObjectId.
    *   **Requirement:** This field must be mandatory for storage but *optional* for the frontend (as the backend will inject it).

## Phase 2: Authentication System

3.  **Implement JWT Authentication:**
    *   Create a `/token` endpoint to validate email/password and return a **Signed JWT (JSON Web Token)**.
    *   Embed the user's identity (email) into the token's payload.

4.  **Create a Dependency Injection:**
    *   Write a helper function `get_current_user` in your API.
    *   This function should:
        *   Read the `Authorization: Bearer <token>` header.
        *   Decode and verify the token signature.
        *   Return the `User` object if valid, or raise a 401 error if invalid.

## Phase 3: Secure API Endpoints (The Core Logic)

5.  **Secure the "Create" (POST) Logic:**
    *   In your create endpoints (e.g., `POST /api/leads`), do **not** accept the `owner_id` from the request body.
    *   Instead, extract the user from the `get_current_user` dependency.
    *   **Action:** `new_item.owner_email = current_user.email`
    *   Save to database.

6.  **Secure the "Read" (GET) Logic:**
    *   In your fetch endpoints (e.g., `GET /api/leads`), never return `db.contacts.find_all()`.
    *   **Action:** Always filter by the user: `db.contacts.find({ "owner_email": current_user.email })`.

7.  **Secure "Update/Delete" (PUT/DELETE) Logic:**
    *   Prevent users from editing IDs they don't own.
    *   **Action:** When running an update/delete command, include the owner in the query filter:
        `db.contacts.update_one({ "id": target_id, "owner_email": current_user.email }, ...)`
    *   If the result count is 0, return a 404/403 (Item not found or unauthorized).

## Phase 4: Frontend Integration

8.  **Token Management:**
    *   On Login: Store the received `access_token` in `localStorage` or `cookies`.
    *   On Logout: Clear this token.

9.  **Authenticated Requests:**
    *   Create a request interceptor or helper function (e.g., `fetchWithAuth`).
    *   Ensure **every** API call to the backend includes the header:
        `Authorization: Bearer <stored_token>`

## Phase 5: Validation/Testing

10. **Multi-User Test:**
    *   Create User A and User B.
    *   User A adds "Lead X".
    *   Login as User B; verify "Lead X" is **not** visible.
    *   Login as User A; verify "Lead X" **is** visible.
