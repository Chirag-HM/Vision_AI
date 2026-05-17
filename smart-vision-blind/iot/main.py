import asyncio
import websockets
import json
import time

# Mocking GPIO for development on Windows/Mac
# Replace with `import RPi.GPIO as GPIO` when running on actual Raspberry Pi
class MockGPIO:
    BCM = "BCM"
    OUT = "OUT"
    IN = "IN"
    def setmode(self, mode): pass
    def setup(self, pin, mode): pass
    def output(self, pin, state): pass
    def cleanup(self): pass

GPIO = MockGPIO()

# Hardware configuration (BCM pin numbering)
TRIG_PIN = 23
ECHO_PIN = 24
VIB_MOTOR_PIN = 18

BACKEND_WS_URL = "ws://localhost:8000/ws/iot"

async def initialize_hardware():
    """Sets up the GPIO pins for the sensors and motor."""
    print("Initializing hardware...")
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(TRIG_PIN, GPIO.OUT)
    GPIO.setup(ECHO_PIN, GPIO.IN)
    GPIO.setup(VIB_MOTOR_PIN, GPIO.OUT)
    print("Hardware initialized.")

async def distance_sensor_loop():
    """
    Simulates the HC-SR04 ultrasonic sensor loop.
    In real usage, this will trigger the sensor and measure echo pulse duration.
    """
    while True:
        # Simulate distance reading
        distance_cm = 150 # Placeholder value
        
        # Determine vibration intensity based on distance (Requirement #1)
        if distance_cm < 100:
            print(f"Distance: {distance_cm}cm - Strong Vibration!")
            # GPIO.output(VIB_MOTOR_PIN, GPIO.HIGH) # Turn on strong vibration
        elif 100 <= distance_cm < 200:
            print(f"Distance: {distance_cm}cm - Gentle Vibration.")
            # Gentle vibration logic here (e.g., PWM)
        
        await asyncio.sleep(1) # Check distance every second

async def websocket_client_loop():
    """
    Maintains a persistent connection to the backend server
    to send GPS, SOS, and receive commands.
    """
    while True:
        try:
            print(f"Connecting to backend: {BACKEND_WS_URL}")
            async with websockets.connect(BACKEND_WS_URL) as websocket:
                print("Connected to backend!")
                while True:
                    # Example: Send mock GPS data every 5 seconds
                    payload = {
                        "type": "gps_update",
                        "lat": 12.9716,
                        "lng": 77.5946,
                        "timestamp": time.time()
                    }
                    await websocket.send(json.dumps(payload))
                    
                    # Receive any messages from the backend (like navigation instructions)
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                        print(f"Received from backend: {response}")
                    except asyncio.TimeoutError:
                        pass # No message received within timeout, continue loop
                    
        except Exception as e:
            print(f"WebSocket connection error: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)

async def main():
    """Main entry point for the IoT application."""
    try:
        await initialize_hardware()
        
        # Run loops concurrently
        await asyncio.gather(
            distance_sensor_loop(),
            websocket_client_loop()
        )
    except KeyboardInterrupt:
        print("Shutting down gracefully...")
    finally:
        GPIO.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
