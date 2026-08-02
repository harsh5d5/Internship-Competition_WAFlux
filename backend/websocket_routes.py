from fastapi import WebSocket, WebSocketDisconnect, Depends
from datetime import datetime
from websocket_manager import manager as ws_manager
from models import User

# NOTE: These functions are imported and registered in main.py

async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time chat and notifications.
    
    Flow:
    1. Client connects with their user_id (email)
    2. Server accepts and registers the connection
    3. Client can send/receive messages in real-time
    4. Server broadcasts new messages to connected clients
    """
    await ws_manager.connect(websocket, user_id)
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "message": "WebSocket connection established",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep connection alive and listen for messages
        while True:
            # Wait for messages from client
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get("type")
            
            if message_type == "ping":
                # Heartbeat to keep connection alive
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                })
                
            elif message_type == "chat_message":
                # Handle incoming chat message
                lead_id = data.get("lead_id")
                message_text = data.get("message")
                
                # Process the message (this will trigger automation if needed)
                # The automation will use ws_manager.send_to_lead() to send replies
                print(f"📨 Received message from {user_id} to lead {lead_id}: {message_text}")
                
                # Echo confirmation back to sender
                await websocket.send_json({
                    "type": "message_sent",
                    "lead_id": lead_id,
                    "status": "delivered",
                    "timestamp": datetime.now().isoformat()
                })
                
            elif message_type == "typing":
                # Handle typing indicators
                lead_id = data.get("lead_id")
                is_typing = data.get("is_typing", False)
                
                # Could broadcast to other users if needed
                print(f"⌨️  User {user_id} typing in lead {lead_id}: {is_typing}")
                
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
        print(f"🔌 WebSocket disconnected: {user_id}")
    except Exception as e:
        print(f"❌ WebSocket error for {user_id}: {str(e)}")
        ws_manager.disconnect(websocket, user_id)


async def websocket_status(current_user: User):
    """
    Get WebSocket connection status and statistics.
    Useful for debugging and monitoring.
    """
    return {
        "active_users": ws_manager.get_active_users(),
        "total_connections": ws_manager.get_connection_count(),
        "user_connections": ws_manager.get_connection_count(current_user.email)
    }
