import sys

# Import our offline ML matcher
try:
    from intent_classifier import IntentClassifier
except ImportError:
    print("Error: Missing dependencies. Please run: pip install fuzzywuzzy python-Levenshtein requests")
    sys.exit(1)

# Import our Actions
from actions.location import get_current_location, get_distance_to_home
from actions.sos import trigger_sos, cancel_sos
from actions.navigation import start_navigation, stop_navigation
from actions.bus import query_bus
from actions.environment import describe_surroundings, check_distance
from actions.volunteer import request_volunteer
from actions.battery import get_battery_level

class MockVoiceEngine:
    def __init__(self):
        print("Initializing Mock Smart Vision Voice Engine (No Hardware Required)...")
        self.classifier = IntentClassifier()

    def execute_intent(self, intent_data: dict) -> str:
        """Executes the corresponding mock hardware action based on intent."""
        intent = intent_data.get("intent", "unknown")
        entities = intent_data.get("entities", {})

        if intent == "location_current":
            return get_current_location()
        elif intent == "location_distance":
            return get_distance_to_home()
        elif intent == "sos_trigger":
            return trigger_sos()
        elif intent == "sos_cancel":
            return cancel_sos()
        elif intent == "nav_start":
            return start_navigation(entities.get("destination", ""))
        elif intent == "nav_stop":
            return stop_navigation()
        elif intent == "bus_query":
            return query_bus(entities.get("destination", ""))
        elif intent == "env_describe":
            return describe_surroundings()
        elif intent == "env_distance":
            return check_distance()
        elif intent == "vol_request":
            return request_volunteer()
        elif intent == "battery_query":
            return get_battery_level()
        else:
            return "Sorry, I did not understand your command."

    def run_tests(self):
        # A list of simulated transcribed voice commands
        test_phrases = [
            "Hey Vision, what is my battery level right now?",
            "Take me to the nearest metro station please.",
            "Distance to obstacle",
            "Emergency SOS I need help!",
            "Cancel SOS everything is fine.",
            "When is the next bus to central park?",
            "Can you describe my surroundings?"
        ]
        
        print("\n" + "="*50)
        print("RUNNING AUTOMATED MOCK TESTS")
        print("="*50)
        
        for phrase in test_phrases:
            print(f"\n[You Spoke]: \"{phrase}\"")
            
            # 1. Classify
            intent_data = self.classifier.classify(phrase)
            print(f"[Classifier]: Intent={intent_data['intent']} | Entities={intent_data['entities']}")
            
            # 2. Execute
            response_text = self.execute_intent(intent_data)
            
            # 3. Speak (Mocked)
            print(f"[TTS Output]: \"{response_text}\"")
            print("-" * 50)

if __name__ == "__main__":
    engine = MockVoiceEngine()
    engine.run_tests()
    
    # Optional: Interactive loop
    print("\nTry it yourself! Type a command below (or type 'exit' to quit):")
    while True:
        try:
            user_input = input(">> ")
            if user_input.lower() in ['exit', 'quit']:
                break
            
            intent_data = engine.classifier.classify(user_input)
            response = engine.execute_intent(intent_data)
            print(f"Vision says: \"{response}\"\n")
            
        except KeyboardInterrupt:
            break
