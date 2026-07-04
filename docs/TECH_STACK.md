# Technical Stack & Schema Specifications
## Smart Vision Platform

---

### 1. Technology Stack Architecture Matrix

```
  ┌─────────────────────────────────────────────────────────────┐
  │                        FRONTEND CLIENT                      │
  │  React 18  •  TypeScript  •  Vite  •  TailwindCSS  •  HTML5 │
  │  React Leaflet (OpenStreetMap Tile Layer Integration)       │
  │  Framer Motion (Premium Animations & Micro-transitions)      │
  │  Lucide React (Modern System Icon Set)                      │
  │  Web Speech API (Native Speech Synthesis & Accessibility)   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                     HTTP / WebSocket Connection
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │                       BACKEND API SERVER                    │
  │  FastAPI (Uvicorn Async ASGI Platform)                      │
  │  WebSockets (Persistent Duplex Heartbeat Channel)           │
  │  Beanie ODM (Pydantic v1/v2 Document Object Mapper)         │
  │  Motor (MongoDB Async Driver)                               │
  │  SQLAlchemy & SQLite (Legacy Authentication Storage)        │
  │  Passlib (Bcrypt Password Hashing)                          │
  │  PyJWT / Jose (HMAC SHA-256 JWT Token Signing)              │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                   Direct Database Drivers & IoT IP
                                 │
  ┌──────────────────────────────┴──────────────────────────────┐
  │                   DATABASES & COMPUTE CLIENT                │
  │  MongoDB Atlas (Cloud Geospatial Document Clusters)         │
  │  SQLite Database (`smart_vision.db` Local File)             │
  │                                                             │
  │  IoT Hardware (Raspberry Pi Mock/Linux)                     │
  │  - Python 3 Async Client                                    │
  │  - Vosk Speech Recognizer (Offline Wake Word)               │
  │  - OpenAI Whisper STT Model (Speech-to-Text)                │
  │  - gTTS (Google Text-to-Speech API Synthesis)               │
  │  - FuzzyWuzzy (Levenshtein Distance Intent Classifier)      │
  │  - RPi.GPIO (Hardware Sensor HC-SR04 Driver)                │
  └─────────────────────────────────────────────────────────────┘
```

---

### 2. Database Architectural Transition Plan

> [!IMPORTANT]
> **Active Database Coexistence Issue**: 
> The codebase currently runs a dual-database model. Authentication and Session Management (`backend/auth`) are built on **SQLite (SQLAlchemy + SQLite File)**. Meanwhile, IoT operations, volunteer tracking, and device telemetry utilize **MongoDB Atlas (Beanie ODM + Motor)**. 
> 
> *MongoDB equivalents for user and session management have already been created in `backend/models/user.py` and `backend/models/token.py`*. 
> 
> **Immediate Action Required**: A core task is refactoring `backend/auth/router.py` and `backend/auth/dependencies.py` to completely eliminate the SQLite engine and merge auth operations into MongoDB Atlas via Beanie Document APIs.

---

### 3. Detailed MongoDB Collection Schemas (Beanie Documents)

All collections are hosted in MongoDB Atlas and managed via Beanie. Geospatial fields are structured using GeoJSON standard formatting.

#### 3.1. `users` Collection
Stores all profiles and role flags.
* **Document Class**: `models.user.User`
* **Properties**:
  * `_id` (`PydanticObjectId`): MongoDB document identifier.
  * `email` (`EmailStr`): Unique indexed user email.
  * `hashed_password` (`str`): Strong Bcrypt hash.
  * `role` (`UserRole`): Enum representing permissions (`BLIND_USER`, `VOLUNTEER`, `CAREGIVER`, `ADMIN`).
  * `is_verified` (`bool`): Account activation flag.
  * `full_name` (`str`): User's legal name.
  * `phone` (`str`): Primary phone number (with country code).
  * `city` (`str`): Location city.
  * `created_at` (`datetime`): Timestamp of creation.
  * `updated_at` (`datetime`): Timestamp of last profile edit.

#### 3.2. `refresh_tokens` Collection
Maintains active OAuth2 refresh tokens for token rotation security.
* **Document Class**: `models.token.RefreshToken`
* **Properties**:
  * `user_id` (`PydanticObjectId`): Link to corresponding user.
  * `token_hash` (`str`): SHA-256 hash of the raw token.
  * `expires_at` (`datetime`): Expiration datetime.
  * `is_blacklisted` (`bool`): Flag to revoke access on logout.

#### 3.3. `devices` Collection
Tracks physical smart stick connectivity and telemetry.
* **Document Class**: `models.device.Device`
* **Properties**:
  * `user_id` (`PydanticObjectId`): Associated blind user.
  * `device_id` (`str`): Unique hardware identifier (e.g., `PI-001-TEST`).
  * `is_online` (`bool`): Active connection state (WebSocket heartbeat).
  * `battery` (`int`): Charge percentage (0 to 100).
  * `location` (`dict`): GeoJSON Point `{ "type": "Point", "coordinates": [lng, lat] }`.
  * `last_seen` (`datetime`): Heartbeat timestamp.
* **Geospatial Indexes**: `2dsphere` on `location` field.

#### 3.4. `sos_events` Collection
Records safety triggers and emergency tracking details.
* **Document Class**: `models.device.SOSEvent`
* **Properties**:
  * `user_id` (`PydanticObjectId`): Initiating blind user.
  * `location` (`dict`): GeoJSON Point of incident location.
  * `triggered_at` (`datetime`): Timestamp of panic trigger.
  * `cancelled_at` (`datetime` | `None`): Timestamp of cancellation.
  * `is_active` (`bool`): Flag indicating if crisis is ongoing.
  * `notified_caregivers` (`list[PydanticObjectId]`): Caregivers alerted during cascade.

#### 3.5. `volunteers` Collection
Maintains geolocation records for emergency response vectors.
* **Document Class**: `models.volunteer.Volunteer`
* **Properties**:
  * `user_id` (`PydanticObjectId`): Associated system user.
  * `is_available` (`bool`): Flag to accept geolocated requests.
  * `city` (`str`): Area profile.
  * `skills` (`list[str]`): Capabilities (e.g. `["Navigation", "Reading"]`).
  * `rating` (`float`): Overall rating.
  * `total_assists` (`int`): Count of successful operations.
  * `location` (`dict`): GeoJSON Point of current availability coordinates.
* **Geospatial Indexes**: `2dsphere` on `location`. Enables `find_near` query logic using MongoDB `$nearSphere` math limits.

#### 3.6. `help_requests` Collection
Matches requesting blind users with a nearby volunteer helper.
* **Document Class**: `models.volunteer.HelpRequest`
* **Properties**:
  * `requester_id` (`PydanticObjectId`): Requesting blind user.
  * `volunteer_id` (`PydanticObjectId` | `None`): Accepted helper reference.
  * `status` (`HelpRequestStatus`): Enum (`PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
  * `request_type` (`str`): Assistance category (e.g., `"Navigation to bus stop"`).
  * `location` (`dict`): GeoJSON Point coordinates of matching request.
  * `created_at` (`datetime`): Creation time.
  * `ended_at` (`datetime` | `None`): Completion time.

#### 3.7. `caregiver_links` Collection
Links caregiver accounts to their monitored blind relatives.
* **Document Class**: `models.caregiver.CaregiverLink`
* **Properties**:
  * `caregiver_id` (`PydanticObjectId`): Caregiver account reference.
  * `user_id` (`PydanticObjectId`): Blind user profile reference.
  * `linked_at` (`datetime`): Linkage authorization timestamp.

#### 3.8. `iot_logs` Collection
High-volume sensor streaming audit trail.
* **Document Class**: `models.iot_log.IotLog`
* **Properties**:
  * `device_id` (`str`): Reporting device ID.
  * `user_id` (`PydanticObjectId`): User operating the stick.
  * `event` (`str`): Event keyword (e.g. `"obstacle_detected"`).
  * `data` (`dict`): Sensor payload details (e.g. `{"distance_m": 0.8, "direction": "front"}`).
  * `timestamp` (`datetime`): Reporting timestamp.
* **Compound Indexes**: 
  * Compound index `[("device_id", 1), ("timestamp", -1)]` for quick chart loading.
  * **TTL Index**: Configured to auto-delete documents older than **30 days** (`expireAfterSeconds: 2592000`) to maintain a clean DB footprint.

---

### 4. Physical IoT Sensor & Haptic Specification

#### 4.1. Sonar Circuitry (HC-SR04)
The distance sensor requires custom hardware triggering using Raspberry Pi GPIO.
* **Ultrasonic Distance Measurement**:
  * **Trigger Pin (GPIO 23)**: Input high pulse for 10 microseconds to initiate high-frequency sound wave (40 kHz).
  * **Echo Pin (GPIO 24)**: Hardware pin that goes high when wave is emitted and drops when rebound echo is captured.
  * **Distance Formula**: 
    $$\text{Distance (cm)} = \frac{\text{Echo Pulse Width (seconds)} \times 34300}{2}$$
* **Haptic Vibration Intensity Modulation (GPIO 18)**:
  * Employs **Pulse Width Modulation (PWM)** on the vibration motor control pin.
  * **PWM Duty Cycle Scale**:
    * Distance under 100 cm: Duty Cycle **100%** (constant high vibration).
    * Distance between 100-200 cm: Duty Cycle **40%** (pulsing gentle warning).
    * Distance above 200 cm: Duty Cycle **0%** (inactive).
