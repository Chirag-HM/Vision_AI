def start_navigation(destination: str) -> str:
    if not destination:
        return "Please specify a destination to navigate to."
        
    # MOCK ACTION: Google Maps Directions API -> Get Step-by-Step Route
    print(f"[Action: Navigation] Fetching directions to '{destination}'...")
    print(f"[Action: Navigation] Route loaded into memory.")
    
    # In reality, this would initiate a background thread monitoring GPS vs route checkpoints
    return f"Starting navigation to {destination}. Head straight on the current road for 200 metres."

def stop_navigation() -> str:
    # MOCK ACTION: Clear active route
    print("[Action: Navigation] Clearing active route from memory.")
    return "Navigation stopped."
