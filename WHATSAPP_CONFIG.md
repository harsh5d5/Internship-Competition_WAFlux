# WhatsApp API Configuration Feature

## Usage Overview
This feature allows users to connect their own WhatsApp Business numbers to the WAFlux platform. 
**Important:** We (WAFlux) do not provide these credentials. The user must obtain them from the Meta (Facebook) Developer Portal.

---

## 🔑 Key Concepts for Users

### 1. Phone Number ID
*   **Definition:** A unique identifier for the phone number within Meta's system.
*   **Analogy:** Like a **Student ID** at a university. Even though your name is "John", the system knows you as "ID 55501". WhatsApp sends messages using this ID, not the raw phone number string.

### 2. WhatsApp Business Account ID (WABA ID)
*   **Definition:** The ID of the Business Portfolio that owns the phone numbers.
*   **Analogy:** The **Landlord**. One landlord (Business ID) can own many apartments (Phone Numbers). This ensures billing and limits are applied to the correct company.

### 3. Permanent Access Token
*   **Definition:** The digital "password" that grants WAFlux permission to send messages on behalf of the user.
*   **Critical Warning:** Users often copy the *Temporary Token* (expires in 24h). They **must** generate a *System User Token* (Permanent) for long-term connection.
*   **Analogy:** The **House Key 🔑**. 
    *   **Temporary Token** = Guest key (stops working tomorrow).
    *   **Permanent Token** = Family key (works forever).

---

## 🏦 The Ownership Concept (Bank Account Analogy)
If a user asks why *they* have to provide these keys instead of us giving them:

*   Think of **WAFlux** like **PayPal** or a generic Payment App.
*   Think of the **WhatsApp Account** like the user's **Bank Account**.
*   We provide the *technology* to make transactions (send messages), but we don't own the money (the number).
*   The User must go to their "Bank" (Meta), get their credentials, and enter them into our app to authorize us to work for them.

---

## 🛠 Implementation Plan

### Phase 1: Backend Foundation (Python/FastAPI)
1.  **Define Data Model (`models.py`)**
    *   Create `WhatsAppConfig` model: `phone_number_id`, `business_account_id`, `access_token`.
2.  **Create API Endpoints (`main.py`)**
    *   `POST /api/config/whatsapp`: Save/Update credentials.
    *   `GET /api/config/whatsapp`: Retrieve current status (mask sensitive token).

### Phase 2: Frontend UI (Next.js/React)
3.  **Create Settings Page**
    *   `client/app/dashboard/settings/page.tsx`
4.  **Build Configuration Form**
    *   Inputs: Phone ID, WABA ID, Access Token (Hidden).
    *   Logic: Fetch existing config on load, Save new config.
5.  **Add Explainer UI**
    *   Implement the "Simple Explanation" text and tooltips to guide non-technical users.

### Phase 3: Status & Validation
6.  **Connection Status**
    *   Show "🟢 Connected" if keys exist in DB.
    *   Show "🔴 Disconnected" if keys are missing.
