import random

def get_battery_level() -> str:
    # MOCK ACTION: Read ADC / GPIO for battery voltage
    print("[Action: Battery] Reading ADC pin for battery level...")
    level = random.randint(15, 100)
    
    msg = f"Your stick battery is at {level} percent."
    if level <= 20:
        msg += " Please charge it soon."
        
    return msg
