import os
import wave
import pyaudio
import numpy as np
import whisper

class STTManager:
    def __init__(self, model_size="base"):
        print(f"[STT] Loading Whisper model '{model_size}'...")
        # Load the whisper model. 'base' or 'tiny' is recommended for Raspberry Pi
        self.model = whisper.load_model(model_size)
        
        self.CHUNK = 1024
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 1
        self.RATE = 16000
        self.SILENCE_THRESHOLD = 500  # Adjust based on mic sensitivity
        self.SILENCE_LIMIT = 1.0      # Seconds of silence before stopping (500ms to 1s)
        self.MAX_RECORD_SECONDS = 8.0 # Maximum recording time
        
        self.temp_wav = "temp_record.wav"
        self.audio = pyaudio.PyAudio()

    def record_until_silence(self) -> str:
        """
        Records audio from the microphone until silence is detected or max limit reached.
        Returns the path to the recorded WAV file.
        """
        stream = self.audio.open(format=self.FORMAT,
                                 channels=self.CHANNELS,
                                 rate=self.RATE,
                                 input=True,
                                 frames_per_buffer=self.CHUNK)

        print("[STT] Listening for command...")
        frames = []
        silent_chunks = 0
        max_silent_chunks = int((self.RATE / self.CHUNK) * self.SILENCE_LIMIT)
        max_total_chunks = int((self.RATE / self.CHUNK) * self.MAX_RECORD_SECONDS)

        for _ in range(max_total_chunks):
            data = stream.read(self.CHUNK, exception_on_overflow=False)
            frames.append(data)
            
            # Check for silence using numpy root mean square
            audio_data = np.frombuffer(data, dtype=np.int16)
            rms = np.sqrt(np.mean(audio_data.astype(np.float32)**2))
            
            if rms < self.SILENCE_THRESHOLD:
                silent_chunks += 1
            else:
                silent_chunks = 0
                
            if silent_chunks > max_silent_chunks:
                print("[STT] Silence detected. Stopping recording.")
                break

        stream.stop_stream()
        stream.close()

        # Save to WAV
        wf = wave.open(self.temp_wav, 'wb')
        wf.setnchannels(self.CHANNELS)
        wf.setsampwidth(self.audio.get_sample_size(self.FORMAT))
        wf.setframerate(self.RATE)
        wf.writeframes(b''.join(frames))
        wf.close()
        
        return self.temp_wav

    def transcribe(self, audio_file_path=None) -> str:
        """
        Transcribe the audio file using Whisper.
        If no file provided, records from mic first.
        """
        try:
            target_file = audio_file_path if audio_file_path else self.record_until_silence()
            print("[STT] Transcribing audio...")
            result = self.model.transcribe(target_file, fp16=False)
            text = result["text"].strip()
            print(f"[STT] Heard: {text}")
            return text
        except Exception as e:
            print(f"[STT Error] {e}")
            return ""
        finally:
            if not audio_file_path and os.path.exists(self.temp_wav):
                try:
                    os.remove(self.temp_wav)
                except:
                    pass

if __name__ == "__main__":
    stt = STTManager(model_size="tiny")
    text = stt.transcribe()
    print(f"Final Text: {text}")
