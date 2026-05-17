import random

def query_bus(destination: str = None) -> str:
    # MOCK ACTION: Read GPS -> Call Transit API -> Nearest Stop ETA
    print("[Action: Bus] Fetching live transit schedules...")
    
    stops = ["Central Station", "Boulevard", "Market Square"]
    routes = ["500C", "335E", "G3"]
    
    stop = random.choice(stops)
    route = random.choice(routes)
    distance = random.randint(50, 400)
    eta = random.randint(2, 15)
    
    if destination:
        print(f"[Action: Bus] Filtering routes towards {destination}")
        
    return f"The nearest bus stop is {stop}, {distance} metres ahead. Next bus {route} arrives in {eta} minutes."
