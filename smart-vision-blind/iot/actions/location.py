import random

def get_current_location() -> str:
    # MOCK ACTION: Read GPS module -> Call Nominatim -> Get Address
    print("[Action: Location] Reading GPS coordinates and fetching address...")
    # Simulate network call delay
    # In reality, you would use: requests.get(f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json")
    mock_address = "123 MG Road, near the Metro Station"
    return f"You are currently at {mock_address}."

def get_distance_to_home() -> str:
    # MOCK ACTION: Read GPS -> Calculate Haversine distance to saved home coords
    print("[Action: Location] Calculating distance to saved home coordinates...")
    dist_km = round(random.uniform(0.5, 5.0), 1)
    time_min = int(dist_km * 12) # ~12 mins per km walking
    return f"You are {dist_km} kilometres from home. Walking time is approximately {time_min} minutes."
