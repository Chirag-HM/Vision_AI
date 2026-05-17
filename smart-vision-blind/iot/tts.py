import os
import time
from gtts import gTTS
import pygame

class TTSManager:
    def __init__(self):
        # Initialize the pygame mixer for audio playback
        pygame.mixer.init()
        self.temp_file = "temp_speech.mp3"

    def speak(self, text: str):
        """
        Convert text to speech using gTTS and play it via pygame.
        This blocks until the audio finishes playing.
        """
        try:
            print(f"[TTS] Speaking: {text}")
            
            # Generate speech
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(self.temp_file)
            
            # Play speech
            pygame.mixer.music.load(self.temp_file)
            pygame.mixer.music.play()
            
            # Wait until playing is finished
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
                
        except Exception as e:
            print(f"[TTS Error] {e}")
        finally:
            # Clean up the audio file if it exists and playback stopped
            try:
                pygame.mixer.music.unload()
                if os.path.exists(self.temp_file):
                    os.remove(self.temp_file)
            except Exception as cleanup_error:
                print(f"[TTS Cleanup Error] {cleanup_error}")

if __name__ == "__main__":
    # Test script
    tts = TTSManager()
    tts.speak("Hello. I am Vision. How can I assist you today?")
