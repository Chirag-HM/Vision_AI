import random

def describe_surroundings() -> str:
    # MOCK ACTION: Capture Pi Camera Frame -> Run YOLOv8 -> Describe
    print("[Action: Environment] Capturing image and running YOLOv8 object detection...")
    
    scenarios = [
        "a car parked on the left, and a clear path ahead",
        "two people walking towards you, and a pole 3 metres ahead",
        "a crosswalk directly in front of you"
    ]
    
    description = random.choice(scenarios)
    return f"I can see {description}."

def check_distance() -> str:
    # MOCK ACTION: Read HC-SR04 Ultrasonic sensor
    print("[Action: Environment] Pinging ultrasonic sensor...")
    
    dist_m = round(random.uniform(0.3, 4.0), 1)
    
    if dist_m < 0.5:
        return f"Warning: The nearest obstacle is very close, only {dist_m} metres in front of you."
    return f"The nearest obstacle is {dist_m} metres in front of you."
