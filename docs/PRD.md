# Product Requirements Document (PRD)
## Smart Vision: AI-Powered Assistive IoT Platform for the Visually Impaired

---

### 1. Vision & Core Philosophy
The visually impaired face significant daily challenges in independent navigation, hazard avoidance, public transit coordination, and emergency situations. **Smart Vision** bridges this gap by merging custom assistive IoT hardware (the "Smart Stick") with a real-time cloud backend and an accessible web application. 

The goal is to serve as **"Eyes for the World"**—empowering users with audio-haptic environmental awareness, a standby support network of nearby volunteers, and active caregiver monitoring to ensure safety and restore independence.

---

### 2. User Roles & Target Personas

```
                     ┌──────────────────┐
                     │    Admin Panel   │
                     └────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
  │  Blind User │      │  Caregiver  │      │  Volunteer  │
  └─────────────┘      └─────────────┘      └─────────────┘
  (IoT + Voice)        (Live Map HUD)       (GeoRTC Helper)
```

#### A. Blind User (The Recipient)
* **Description**: A visually impaired individual who utilizes the physical Smart Stick device and a standard Bluetooth earpiece.
* **Core Needs**: Immediate hazard detection, simple hands-free controls, audio transit assistance, and a fast panic button.
* **Interaction**: Voice commands triggered via a wake word, haptic/vibration feedback, and synthesized speech responses.

#### B. Caregiver / Family Member (The Monitor)
* **Description**: Relatives or guardians responsible for the well-being of the blind user.
* **Core Needs**: Real-time location tracking, geofencing, battery depletion alerts, emergency SOS signals, and historical route analysis.
* **Interaction**: Premium real-time web dashboard displaying live maps, activity feeds, and device state.

#### C. Volunteer (The Helper)
* **Description**: Verified community members willing to assist blind users with brief visual tasks (e.g., finding a dropped item, reading a prescription label).
* **Core Needs**: Streamlined, low-friction help request notifications, precise navigation map markers, and high-fidelity video/audio WebRTC pipelines.
* **Interaction**: Web dashboard supporting location availability, help queues, and real-time audio/video links.

#### D. System Administrator (The Moderator)
* **Description**: Operations team managing platform security, user verification, and volunteer vetting.

---

### 3. Key Feature Specifications

#### 3.1. Smart Obstacle Sonar (Hardware Safety)
* **Description**: Continuous physical scanning of the user's path using ultrasonic sensors.
* **Requirements**:
  * Measure distances in real-time using an HC-SR04 ultrasonic sensor.
  * **Haptic Vibration Mapping**:
    * **Distance < 100 cm**: Strong, continuous vibration pulse (immediate hazard).
    * **100 cm ≤ Distance < 200 cm**: Gentle, intermittent vibration pulse (approaching object).
    * **Distance ≥ 200 cm**: No vibration (clear path).
  * System must support high-fidelity hardware fallback or software simulation on non-Linux architectures.

#### 3.2. Integrated Voice Engine (Conversational Interface)
* **Description**: Fully hands-free voice interface running locally on the IoT device for natural query resolution.
* **Pipeline**:
  1. **Wake Word Detector**: Continuously listens for the word `"Vision"` using a lightweight local engine (Vosk) to activate transcription.
  2. **Speech-to-Text (STT)**: Records user utterance and transcribes it using an optimized local neural model (Whisper).
  3. **Intent Classifier**: Maps transcribed phrases to functional intents using fuzzy match scoring.
  4. **Text-to-Speech (TTS)**: Translates system responses back into natural audio announcements via gTTS.
* **Supported Commands**:
  * *"Where am I?"* → Coordinates translated to city streets.
  * *"Is my home close?"* → Calculates distance to pre-configured coordinates.
  * *"Call for emergency help"* / *"Trigger SOS"* → Initiates immediate crisis state.
  * *"Search for arriving buses"* → Queries nearby bus routes.
  * *"Request a volunteer"* → Alerts active helpers within a 5km radius.
  * *"Check my battery"* → Speaks current charge percentage.

#### 3.3. Real-Time Caregiver Dashboard (Live Telemetry HUD)
* **Description**: A premium, high-frequency dashboard designed for caregivers to maintain visual contact.
* **Telemetry Fields**:
  * Online/Offline connection status (WebSocket heartbeat).
  * Smooth GPS track overlay (updated every 5 seconds).
  * Device battery status (with critical visual pulse below 20%).
  * Network signal strength.
  * Real-time activity log feed (log entries for voice commands, transit stops, and sonar warnings).

#### 3.4. Emergency SOS System (Crisis Protocol)
* **Description**: High-priority alarm cascade triggered via voice command or physical stick button.
* **Requirements**:
  * Immediately registers an active SOS event in MongoDB.
  * Generates an intrusive, flashing red alert overlay on the Caregiver Dashboard.
  * Broadcasts current GPS coordinates to all registered caregivers.
  * Stays active until explicitly cancelled by user voice command or caregiver confirmation.

#### 3.5. Live Volunteer Help Network (Geospatial WebRTC)
* **Description**: Real-time on-demand matching system connecting blind users with nearby helpers.
* **Requirements**:
  * Blind user requests assistance via Voice Command.
  * Server searches for active volunteers within a **5 km radius** using a MongoDB geospatial index (`2dsphere`).
  * Alerts active, available volunteers nearby.
  * Upon acceptance, opens a WebRTC video-audio peer connection allowing the volunteer to view the user's camera feed and give directions.

#### 3.6. Smart Bus Transit Schedules (Public Transport Assistance)
* **Description**: Public transit tracking to aid in boarding operations.
* **Requirements**:
  * Uses GPS to find the nearest bus stops.
  * Computes relative distance to stop and next arriving bus schedules.
  * Automatically announces upcoming route numbers (e.g. *"Bus 500C arriving in 2 minutes"*) to the user's Bluetooth earpiece.

#### 3.7. Dual UI Web App (Universal Accessibility)
* **Requirements**:
  * **Standard Dashboard**: Dark glassmorphic design, smooth Framer Motion transitions, responsive grid, interactive Leaflet mapping for caregivers and volunteers.
  * **Accessibility Simple Mode**: Extremely high-contrast black-and-white grid, large clickable blocks, screen-reader friendly heading hierarchies, and automatic text-to-speech audio feedback on hovering elements.

---

### 4. Non-Functional Requirements (NFRs)
1. **Accessibility Compliance**: Adhere strictly to WCAG 2.1 AA guidelines, supporting keyboard-only navigation and full tab-index flows.
2. **Sub-second Latency**: WebSockets telemetry (GPS, logs) must propagate from the Smart Stick to the Caregiver Dashboard in under **300ms**.
3. **Graceful Degradation**: The voice engine and sonar loop must run on simulated threads if hardware peripherals (microphones, GPIOs) are disconnected.
4. **Data Retention & Privacy**: Sensory logging must be stored with a **30-day Time-To-Live (TTL)** to maintain privacy and manage database footprint.
