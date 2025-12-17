
@app.get("/api/dashboard/activity")
async def get_dashboard_activity(current_user: User = Depends(get_current_active_user)):
    contacts = list(db.contacts.find({"owner_email": current_user.email}))
    activity_feed = []
    
    for contact in contacts:
        # Get messages reversed (assuming last is new, but list might be append-only)
        # Actually in simulate_reply we used $push, so last is newest
        msgs = contact.get("messages", [])
        
        # We'll take the last 2 messages from each contact to populate the feed
        recent_msgs = msgs[-2:] if msgs else []
        
        for msg in recent_msgs:
            # Determine type
            msg_type = "message"
            if msg.get("sender") == "them":
                msg_type = "reply"
            elif msg.get("status") == "failed":
                msg_type = "failed"
            elif msg.get("status") == "read":
                 msg_type = "read"
            elif msg.get("sender") == "me":
                 msg_type = "campaign_sent" # mimicking the existing UI style
            
            activity_feed.append({
                "id": msg.get("id") or str(uuid.uuid4()),
                "type": msg_type,
                "user": contact.get("name", "Unknown"),
                "time": msg.get("time", "Recently"),
                "detail": msg.get("text", "")
            })
            
    # Since we don't have real timestamps to sort by, we'll just reverse the order 
    # to show the "bottom" (latest appended) ones first if we consider the extraction order.
    # A better way would be to just return them and let frontend handle, but shuffling or 
    # just taking the last 10 inserted across all contacts is tricky without timestamps.
    # We will just return the list reversed (assuming contacts fetched in order of creation/update usually)
    
    return activity_feed[::-1][:10] # Return top 10 latest
