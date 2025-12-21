from database import db

def cleanup_automations():
    print("Fetching all automation flows...")
    flows = list(db.automation_flows.find({}))
    
    print(f"Total flows found: {len(flows)}")
    
    if len(flows) <= 2:
        print("Less than or equal to 2 flows found. No deletion needed.")
        return

    # Keep the first 2
    flows_to_keep = flows[:2]
    flows_to_delete = flows[2:]
    
    print("Keeping these flows:")
    for f in flows_to_keep:
        print(f" - {f.get('name', 'Unnamed')} (ID: {f.get('id')})")
        
    print(f"\nDeleting {len(flows_to_delete)} flows...")
    
    delete_ids = [f['id'] for f in flows_to_delete]
    
    result = db.automation_flows.delete_many({"id": {"$in": delete_ids}})
    
    print(f"Deleted count: {result.deleted_count}")
    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup_automations()
