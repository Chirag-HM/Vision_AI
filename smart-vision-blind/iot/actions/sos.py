import requests

def trigger_sos() -> str:
    # MOCK ACTION: Read GPS -> POST /sos/trigger -> Turn on Buzzer
    print("[Action: SOS] Triggering CRITICAL SOS alert!")
    print("[Action: SOS] Hardware: Buzzer activated continuously.")
    
    try:
        # Simulate API Call
        # requests.post("http://localhost:8000/api/sos/trigger", json={"lat": 12.97, "lng": 77.60})
        pass
    except Exception as e:
        print(f"[SOS Error] API unreachable: {e}")
        return "SOS alert activated locally. However, network connection failed. Activating loud buzzer."
        
    return "SOS alert sent. Your location has been shared with your emergency contacts. Help is on the way."

def cancel_sos() -> str:
    # MOCK ACTION: POST /sos/cancel -> Turn off Buzzer
    print("[Action: SOS] Cancelling SOS alert.")
    print("[Action: SOS] Hardware: Buzzer deactivated.")
    return "SOS cancelled. Your contacts have been notified that you are safe."
