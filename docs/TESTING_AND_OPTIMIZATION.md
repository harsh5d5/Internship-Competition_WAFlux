# WBIZZ Production Deployment & Testing Guide

## 🎯 Phase 2 Complete - WebSocket Implementation Summary

### ✅ What We've Built

**Backend Infrastructure:**
1. **WebSocket Connection Manager** (`backhand/websocket_manager.py`)
   - Multi-connection support per user
   - Automatic cleanup and error handling
   - Message broadcasting capabilities

2. **WebSocket Endpoints** (`backhand/websocket_routes.py`)
   - `/ws/{user_id}` - Real-time connection endpoint
   - `/ws/status` - Connection monitoring
   - Ping/pong heartbeat system

3. **Integration** (`backhand/main.py`)
   - WebSocket routes registered
   - Ready for real-time chat

**Frontend Infrastructure:**
1. **Custom Hook** (`client/hooks/useWebSocket.ts`)
   - Auto-reconnection (5 attempts)
   - Heartbeat system (30s intervals)
   - Connection status tracking
   - TypeScript support

2. **Integration Guide** (`docs/WEBSOCKET_INTEGRATION_GUIDE.md`)
   - Step-by-step chat integration
   - Fallback polling strategy
   - Testing procedures

---

## 🧪 Step 10: Testing & Optimization

### Testing Checklist

#### 1. Backend WebSocket Testing

**Test WebSocket Endpoint:**
```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Test connection (replace with actual user email)
wscat -c "ws://localhost:8000/ws/test@example.com"

# You should receive:
# {"type":"connection","status":"connected","message":"WebSocket connection established",...}

# Send a ping:
{"type":"ping"}

# Should receive:
# {"type":"pong","timestamp":"..."}
```

**Check Connection Status:**
```bash
# In browser or curl (with valid JWT token):
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/ws/status
```

#### 2. Frontend Hook Testing

**Create Test Component** (`client/app/test-ws/page.tsx`):
```tsx
"use client";

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function WebSocketTest() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(payload.sub);
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
    }, []);

    const { sendMessage, isConnected, connectionStatus } = useWebSocket(userEmail, {
        onMessage: (msg) => {
            console.log('Received:', msg);
            setMessages(prev => [...prev, msg]);
        },
        onConnect: () => console.log('✅ Connected'),
        onDisconnect: () => console.log('🔌 Disconnected'),
    });

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
            
            <div className="mb-4 p-4 bg-gray-100 rounded">
                <p><strong>Status:</strong> {connectionStatus}</p>
                <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
                <p><strong>User:</strong> {userEmail || 'Not logged in'}</p>
            </div>

            <button
                onClick={() => sendMessage({ type: 'ping' })}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                disabled={!isConnected}
            >
                Send Ping
            </button>

            <button
                onClick={() => sendMessage({ 
                    type: 'chat_message', 
                    lead_id: 'test-lead',
                    message: 'Test message'
                })}
                className="bg-green-500 text-white px-4 py-2 rounded"
                disabled={!isConnected}
            >
                Send Test Message
            </button>

            <div className="mt-6">
                <h2 className="font-bold mb-2">Messages:</h2>
                <div className="space-y-2">
                    {messages.map((msg, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                            <pre>{JSON.stringify(msg, null, 2)}</pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

**Access:** `http://localhost:3000/test-ws`

#### 3. Integration Testing

**Test Real-Time Chat:**
1. Open two browser windows (or incognito + normal)
2. Log in as different users in each
3. Start a chat conversation
4. Verify messages appear instantly in both windows
5. Check browser console for WebSocket logs

**Test Reconnection:**
1. Open browser DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Right-click the WebSocket connection → "Close connection"
4. Verify automatic reconnection happens within 3 seconds
5. Check console for reconnection logs

#### 4. Performance Testing

**Monitor Connection Count:**
```python
# Add to backhand/main.py for monitoring
@app.get("/admin/ws-stats")
async def websocket_stats():
    return {
        "active_users": len(ws_manager.get_active_users()),
        "total_connections": ws_manager.get_connection_count(),
        "users": ws_manager.get_active_users()
    }
```

**Load Test:**
```bash
# Install artillery for load testing
npm install -g artillery

# Create test-websocket.yml:
config:
  target: "ws://localhost:8000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - engine: ws
    flow:
      - connect:
          url: "/ws/test-user-{{ $randomNumber() }}"
      - think: 5
      - send: '{"type":"ping"}'
      - think: 5

# Run test:
artillery run test-websocket.yml
```

---

## 🚀 Optimization Recommendations

### 1. Backend Optimizations

**Add Message Queue (Optional - For Scale):**
```python
# For multi-server deployments
# Install: pip install redis

import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

async def broadcast_via_redis(message: dict):
    """Broadcast to all servers via Redis Pub/Sub"""
    redis_client.publish('wbizz_messages', json.dumps(message))
```

**Add Rate Limiting:**
```python
# Prevent spam
from collections import defaultdict
import time

message_timestamps = defaultdict(list)

def check_rate_limit(user_id: str, limit=10, window=60):
    """Allow max 10 messages per 60 seconds"""
    now = time.time()
    timestamps = message_timestamps[user_id]
    
    # Remove old timestamps
    timestamps[:] = [t for t in timestamps if now - t < window]
    
    if len(timestamps) >= limit:
        return False
    
    timestamps.append(now)
    return True
```

### 2. Frontend Optimizations

**Lazy Load WebSocket:**
```tsx
// Only connect when chat page is active
const { sendMessage, isConnected } = useWebSocket(
    isOnChatPage ? userEmail : null,  // Conditional connection
    { /* options */ }
);
```

**Message Batching:**
```tsx
// Batch multiple messages for efficiency
const messageQueue = useRef<any[]>([]);

const flushMessages = useCallback(() => {
    if (messageQueue.current.length > 0) {
        setChats(prev => {
            // Apply all queued updates at once
            let updated = prev;
            messageQueue.current.forEach(msg => {
                updated = applyMessage(updated, msg);
            });
            return updated;
        });
        messageQueue.current = [];
    }
}, []);

useEffect(() => {
    const interval = setInterval(flushMessages, 100); // Flush every 100ms
    return () => clearInterval(interval);
}, [flushMessages]);
```

### 3. Monitoring & Logging

**Add Structured Logging:**
```python
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("websocket")

# Log connections
logger.info(json.dumps({
    "event": "ws_connect",
    "user_id": user_id,
    "timestamp": datetime.now().isoformat()
}))
```

**Frontend Error Tracking:**
```tsx
const { sendMessage } = useWebSocket(userEmail, {
    onError: (error) => {
        // Send to error tracking service (e.g., Sentry)
        console.error('WebSocket error:', error);
        // Sentry.captureException(error);
    }
});
```

---

## 📊 Success Metrics

### What to Monitor

1. **Connection Success Rate**
   - Target: >99% successful connections
   - Track: Failed connection attempts

2. **Message Latency**
   - Target: <100ms for message delivery
   - Track: Time from send to receive

3. **Reconnection Time**
   - Target: <3 seconds
   - Track: Time to re-establish connection

4. **Concurrent Connections**
   - Monitor: Peak concurrent users
   - Alert: If >80% of server capacity

### Logging Examples

**Backend:**
```python
print(f"📊 WebSocket Stats: {ws_manager.get_connection_count()} connections, {len(ws_manager.get_active_users())} users")
```

**Frontend:**
```tsx
console.log(`📊 Message delivered in ${Date.now() - sentTime}ms`);
```

---

## 🎉 Phase 2 Complete!

### What's Next?

**Phase 3 Options:**
1. **Deploy to Production**
   - Use Docker Compose setup from Phase 1
   - Deploy to cloud (AWS, GCP, Azure)
   - Set up SSL/HTTPS

2. **Advanced Features**
   - Typing indicators
   - Read receipts
   - File sharing via WebSocket
   - Voice messages

3. **Scaling**
   - Add Redis for multi-server support
   - Implement horizontal scaling
   - Add load balancer

### Quick Start Testing

```bash
# Terminal 1: Backend
cd backhand
uvicorn main:app --reload

# Terminal 2: Frontend  
cd client
npm run dev

# Terminal 3: Test WebSocket
wscat -c "ws://localhost:8000/ws/test@example.com"
```

**Access test page:** `http://localhost:3000/test-ws`

---

## 🐛 Troubleshooting

**WebSocket won't connect:**
- Check if backend is running on port 8000
- Verify CORS settings allow WebSocket
- Check browser console for errors

**Messages not appearing:**
- Verify user_id matches logged-in user
- Check backend logs for message routing
- Ensure `onMessage` handler is set up

**Frequent disconnections:**
- Check network stability
- Verify heartbeat is working (30s ping)
- Review server timeout settings

**Need Help?**
- Check browser DevTools → Network → WS tab
- Review backend logs for errors
- Test with `wscat` to isolate issues
