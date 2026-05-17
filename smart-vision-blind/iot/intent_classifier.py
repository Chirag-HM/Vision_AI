from fuzzywuzzy import process
import re

class IntentClassifier:
    def __init__(self):
        # Define intent keywords/phrases
        self.intent_patterns = {
            "location_current": [
                "where am i", "what is my location", "tell me my address", "am i lost"
            ],
            "location_distance": [
                "how far am i from home", "distance to home", "are we near home"
            ],
            "sos_trigger": [
                "sos", "help me", "emergency", "call for help", "i need immediate help", "danger"
            ],
            "sos_cancel": [
                "cancel sos", "i am okay", "stop alert", "false alarm", "everything is fine"
            ],
            "nav_start": [
                "navigate to", "take me to", "how do i get to", "give me directions to", "walk to"
            ],
            "nav_stop": [
                "stop navigation", "cancel navigation", "end trip", "we arrived"
            ],
            "bus_query": [
                "when is the next bus", "what buses are nearby", "bus to", "where is the bus stop"
            ],
            "env_describe": [
                "what is around me", "describe my surroundings", "what do you see", "is the path clear"
            ],
            "env_distance": [
                "how close is that obstacle", "how far is that", "distance to obstacle"
            ],
            "vol_request": [
                "call a volunteer", "i need help from a human", "get me a volunteer", "volunteer"
            ],
            "battery_query": [
                "what is my battery", "how much battery do i have", "battery level"
            ]
        }
        
        # Flatten for fuzzywuzzy
        self.flat_phrases = []
        self.phrase_to_intent = {}
        for intent, phrases in self.intent_patterns.items():
            for phrase in phrases:
                self.flat_phrases.append(phrase)
                self.phrase_to_intent[phrase] = intent

    def classify(self, text: str):
        """
        Takes raw transcribed text and returns a dict with 'intent' and 'entities'.
        """
        text = text.lower().strip()
        
        # Remove punctuation for better matching
        text = re.sub(r'[^\w\s]', '', text)

        if not text:
            return {"intent": "unknown", "entities": {}}

        # Fuzzy match against all known phrases
        match, score = process.extractOne(text, self.flat_phrases)
        
        # Threshold for acceptable intent match
        if score > 75:
            intent = self.phrase_to_intent[match]
            entities = self.extract_entities(intent, text)
            return {"intent": intent, "entities": entities, "confidence": score}
        else:
            return {"intent": "unknown", "entities": {}, "confidence": score}

    def extract_entities(self, intent: str, text: str):
        """
        Extract specific entities (like places) based on intent.
        """
        entities = {}
        if intent == "nav_start":
            # Very basic extraction: extract everything after 'to'
            # E.g., "navigate to central park" -> "central park"
            match = re.search(r'(navigate to|take me to|get to|directions to|walk to)\s+(.+)', text)
            if match:
                entities["destination"] = match.group(2).strip()
        elif intent == "bus_query":
            match = re.search(r'bus to\s+(.+)', text)
            if match:
                entities["destination"] = match.group(1).strip()
        return entities

if __name__ == "__main__":
    classifier = IntentClassifier()
    tests = [
        "Hey Vision, navigate to the grocery store please.",
        "SOS I need help immediately",
        "What's my battery level right now?",
        "Describe my surroundings for me."
    ]
    for t in tests:
        res = classifier.classify(t)
        print(f"Text: '{t}' -> Intent: {res['intent']} (Score: {res.get('confidence', 0)}) Entities: {res['entities']}")
