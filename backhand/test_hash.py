from auth import get_password_hash, verify_password

try:
    password = "testpassword"
    hashed = get_password_hash(password)
    print(f"Hashed: {hashed}")
    matches = verify_password(password, hashed)
    print(f"Verify: {matches}")
    if matches:
        print("SUCCESS: Hashing and verification working.")
    else:
        print("FAILURE: Verification failed.")
except Exception as e:
    print(f"ERROR: {e}")
