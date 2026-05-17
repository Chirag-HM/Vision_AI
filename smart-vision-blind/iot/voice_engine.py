import os
import sys
import json
import pyaudio
from vosk import Model, KaldiRecognizer 

from tts import TTSManager
from stt import STTManager
from intent_classifier import IntentClassifier

# Import Actions
from actions.location import get_current_location, get_distance_to_home
from actions.sos import trigger_sos, cancel_sos
from actions.navigation import start_navigation, stop_navigation
from actions.bus import query_bus
from actions.environment import describe_surroundings, check_distance
from actions.volunteer import request_volunteer
from actions.battery import get_battery_level

class VoiceEngine:
    def __init__(self):
        print("Initializing Smart Vision Voice Engine...")
        
        self.tts = TTSManager()
        self.stt = STTManager(model_size="tiny")
        self.classifier = IntentClassifier()
        
        # Initialize Vosk for Wake Word
        # Requires a lightweight vosk model in a folder named 'model'
        # e.g., vosk-model-small-en-us-0.15
        self.VOSK_MODEL_PATH = "model"
        self.wake_word = "vision"
        
        try:
            if not os.path.exists(self.VOSK_MODEL_PATH):
                print(f"[Warning] Vosk model not found at '{self.VOSK_MODEL_PATH}'. Wake word detection will be mocked.")
                self.vosk_model = None
            else:
                self.vosk_model = Model(self.VOSK_MODEL_PATH)
                self.recognizer = KaldiRecognizer(self.vosk_model, 16000)
        except Exception as e:
            print(f"[Vosk Error] Failed to load model: {e}")
            self.vosk_model = None

    def listen_for_wake_word(self):
        """
        Continuously listens until the wake word 'Vision' is detected.
        """
        if not self.vosk_model:
            # Mock if model missing: just wait for enter press to simulate wake word
            print("[Wake Word] Vosk model missing. Press Enter to simulate wake word 'Hey Vision'...")
            input()
            return

        print("[Wake Word] Listening for 'Hey Vision'...")
        audio = pyaudio.PyAudio()
        stream = audio.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=4000)
        stream.start_stream()

        while True:
            data = stream.read(4000, exception_on_overflow=False)
            if self.recognizer.AcceptWaveform(data):
                res = json.loads(self.recognizer.Result())
                text = res.get("text", "").lower()
                if self.wake_word in text:
                    print("[Wake Word] Detected!")
                    break

        stream.stop_stream()
        stream.close()

    def play_chime(self):
        """Plays a short beep to confirm listening."""
        print("[Audio] *BEEP* (Listening...)")
        # In reality: pygame.mixer.Sound('beep.wav').play()

    def execute_intent(self, intent_data: dict) -> str:
        """
        Executes the corresponding hardware action based on intent.
        Returns the TTS response string.
        """
        intent = intent_data.get("intent", "unknown")
        entities = intent_data.get("entities", {})

        print(f"\n[Engine] Executing Intent: {intent} | Entities: {entities}")

        try:
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
                return "Sorry, I did not understand your command. Please try again."
        except Exception as e:
            print(f"[Action Error] {e}")
            return "An error occurred while processing your request."

    def run(self):
        """
        Main Event Loop for the Voice Engine.
        """
        self.tts.speak("Smart Vision System Online.")
        
        while True:
            try:
                # 1. Wait for Wake Word
                self.listen_for_wake_word()
                
                # 2. Confirm Listening
                self.play_chime()
                
                # 3. Record & Transcribe (Whisper)
                text = self.stt.transcribe()
                if not text:
                    continue
                
                # 4. Classify Intent (FuzzyWuzzy)
                intent_data = self.classifier.classify(text)
                
                # 5. Execute Hardware/API Action
                response_text = self.execute_intent(intent_data)
                
                # 6. Speak Reply (gTTS)
                self.tts.speak(response_text)
                
            except KeyboardInterrupt:
                print("\n[Engine] Shutting down...")
                sys.exit(0)
            except Exception as e:
                print(f"[Engine Fatal Error] {e}")
                self.tts.speak("A system error occurred. Restarting voice engine.")

if __name__ == "__main__":
    engine = VoiceEngine()
    engine.run()
