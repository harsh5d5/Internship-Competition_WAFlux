# Step 9: WebSocket Integration into Chat Component

## Current Implementation Analysis

The chat page (`client/app/dashboard/chats/page.tsx`) currently uses **polling** to fetch messages:
- Fetches chats every 3 seconds via `setInterval(fetchChats, 3000)`
- Line 417: `const interval = setInterval(fetchChats, 3000);`

## Integration Plan

### 1. Import WebSocket Hook
Add at the top of the file (after line 14):
```tsx
import { useWebSocket } from '@/hooks/useWebSocket';
```

### 2. Get User Email for WebSocket Connection
Add after state declarations (around line 48):
```tsx
const [userEmail, setUserEmail] = useState<string | null>(null);

useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
        // Decode JWT to get email
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserEmail(payload.sub); // 'sub' contains the email
        } catch (e) {
            console.error("Failed to decode token", e);
        }
    }
}, []);
```

### 3. Initialize WebSocket Connection
Add after user email setup:
```tsx
const { sendMessage, isConnected, connectionStatus } = useWebSocket(userEmail, {
    onMessage: (message) => {
        console.log('📨 Real-time message:', message);
        
        if (message.type === 'new_message') {
            // Update chat list with new message
            const { lead_id, message: newMsg } = message;
            
            setChats(prevChats => prevChats.map(chat => {
                if (chat.id === lead_id) {
                    return {
                        ...chat,
                        messages: [...chat.messages, newMsg],
                        lastMessage: newMsg.text,
                        time: newMsg.time,
                        unread: chat.id === selectedChatId ? 0 : chat.unread + 1
                    };
                }
                return chat;
            }));
        }
    },
    onConnect: () => {
        console.log('✅ WebSocket connected - Real-time chat enabled');
        showToast('Real-time chat connected', 'success');
    },
    onDisconnect: () => {
        console.log('🔌 WebSocket disconnected - Falling back to polling');
        showToast('Connection lost, reconnecting...', 'warning');
    }
});
```

### 4. Modify Polling Logic
Replace the polling interval (line 415-419) with conditional polling:
```tsx
useEffect(() => {
    fetchChats(); // Initial fetch
    
    // Only poll if WebSocket is not connected (fallback)
    if (!isConnected) {
        const interval = setInterval(fetchChats, 5000); // Slower polling as fallback
        return () => clearInterval(interval);
    }
}, [selectedChatId, isConnected]);
```

### 5. Update Send Message Function
Modify `handleSendMessage` (line 458) to use WebSocket:
```tsx
const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !fileInputRef.current?.files?.length) return;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage = {
        id: Date.now(),
        sender: 'me',
        text: inputMessage,
        time: formattedTime,
        timestamp: now.getTime() / 1000,
        status: 'sent',
        avatar: "https://i.pravatar.cc/150?u=me"
    };

    // Optimistic UI update
    const activeChat = chats.find(c => c.id === selectedChatId);
    if (activeChat) {
        const updatedChat = {
            ...activeChat,
            messages: [...activeChat.messages, newMessage],
            lastMessage: inputMessage,
            time: newMessage.time
        };
        const otherChats = chats.filter(c => c.id !== selectedChatId);
        setChats([updatedChat, ...otherChats]);
    }

    setInputMessage("");

    // Send via WebSocket if connected, otherwise use HTTP
    if (isConnected) {
        sendMessage({
            type: 'chat_message',
            lead_id: selectedChatId,
            message: newMessage.text
        });
    }

    // Always sync with backend for persistence
    try {
        const token = localStorage.getItem("access_token");
        await fetch(`http://127.0.0.1:8000/api/leads/${selectedChatId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: newMessage.text,
                sender: 'me',
                time: newMessage.time,
                reply_to: replyingToMessage?.id
            })
        });
        setReplyingToMessage(null);
    } catch (error) {
        console.error("Failed to send message", error);
    }
};
```

### 6. Add Connection Status Indicator
Add to the chat header (around line 773):
```tsx
{isConnected && (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-[10px] text-green-500 font-medium">Live</span>
    </div>
)}
```

## Benefits of This Integration

1. **Real-Time Updates**: Messages appear instantly without waiting for polling
2. **Reduced Server Load**: Polling only happens as fallback
3. **Better UX**: Typing indicators, instant delivery confirmations
4. **Scalable**: WebSocket handles concurrent users efficiently
5. **Fallback**: Gracefully degrades to polling if WebSocket fails

## Testing Steps

1. Open two browser windows with different users
2. Send a message from one user
3. Verify it appears instantly in the other window
4. Check browser console for WebSocket connection logs
5. Disconnect internet and verify fallback to polling works

## Next Steps

After implementing this, we can add:
- Typing indicators
- Read receipts in real-time
- Online/offline status
- Message delivery confirmations
