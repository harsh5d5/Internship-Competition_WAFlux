"""
WebSocket Connection Manager for WBIZZ
Handles real-time connections for chat, notifications, and live updates
"""

from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio


class ConnectionManager:
    """
    Manages WebSocket connections for real-time communication.
    Tracks active connections by user ID and provides broadcast capabilities.
    """
    
    def __init__(self):
        # Store active connections: {user_id: [websocket1, websocket2, ...]}
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """
        Accept a new WebSocket connection and register it.
        
        Args:
            websocket: The WebSocket connection object
            user_id: Unique identifier for the user
        """
        await websocket.accept()
        
        # Initialize user's connection list if first connection
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        # Add this connection to user's list
        self.active_connections[user_id].append(websocket)
        
        print(f"✅ WebSocket connected: User {user_id} (Total connections: {len(self.active_connections[user_id])})")
        
    def disconnect(self, websocket: WebSocket, user_id: str):
        """
        Remove a WebSocket connection when client disconnects.
        
        Args:
            websocket: The WebSocket connection to remove
            user_id: User identifier
        """
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            
            # Clean up empty user entries
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
        print(f"❌ WebSocket disconnected: User {user_id}")
        
    async def send_personal_message(self, message: dict, user_id: str):
        """
        Send a message to a specific user across all their active connections.
        
        Args:
            message: Dictionary containing the message data
            user_id: Target user identifier
        """
        if user_id in self.active_connections:
            # Send to all connections for this user (e.g., multiple browser tabs)
            disconnected = []
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending to {user_id}: {e}")
                    disconnected.append(connection)
            
            # Clean up failed connections
            for conn in disconnected:
                self.disconnect(conn, user_id)
                
    async def broadcast(self, message: dict, exclude_user: str = None):
        """
        Broadcast a message to all connected users.
        
        Args:
            message: Dictionary containing the message data
            exclude_user: Optional user_id to exclude from broadcast
        """
        for user_id, connections in list(self.active_connections.items()):
            if exclude_user and user_id == exclude_user:
                continue
                
            await self.send_personal_message(message, user_id)
            
    async def send_to_lead(self, message: dict, lead_id: str, owner_email: str):
        """
        Send a message to a specific lead's chat interface.
        Used when bot/automation sends a reply.
        
        Args:
            message: Message data to send
            lead_id: The contact/lead ID
            owner_email: The business owner's email (user who owns this lead)
        """
        # The owner_email is the user_id in our system
        await self.send_personal_message({
            "type": "new_message",
            "lead_id": lead_id,
            "message": message
        }, owner_email)
        
    def get_active_users(self) -> List[str]:
        """
        Get list of all currently connected user IDs.
        
        Returns:
            List of user IDs with active connections
        """
        return list(self.active_connections.keys())
        
    def get_connection_count(self, user_id: str = None) -> int:
        """
        Get count of active connections.
        
        Args:
            user_id: Optional specific user to check
            
        Returns:
            Number of connections (total or for specific user)
        """
        if user_id:
            return len(self.active_connections.get(user_id, []))
        return sum(len(conns) for conns in self.active_connections.values())


# Global instance to be used across the application
manager = ConnectionManager()
