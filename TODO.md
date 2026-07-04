# Project Todo Checklist: Smart Vision Platform

Welcome to the **Smart Vision** active task tracker. This document serves as the repository-level task list to align our efforts toward merging the database stack, completing sensor integrations, and certifying accessibility standards.

---

## 📅 Roadmap Checklist

### Phase 1: Database Consolidation (SQL ➔ MongoDB Atlas)
* **Goal**: Merge duplicate user schemas and fully transition from SQLite to MongoDB Atlas using Beanie.
- [ ] **Review Auth Schemas**: Clean up duplicate schemas between `backend/auth/models.py` (SQLite) and `backend/models/user.py` / `backend/models/token.py` (Beanie/MongoDB).
- [ ] **Refactor API Authentication Router**: Modify `backend/auth/router.py` to completely remove SQLAlchemy `Session` injections and utilize `await User.find_one()` / `await RefreshToken.insert()` Beanie APIs.
- [ ] **Refactor Authentication Dependencies**: Rewrite `backend/auth/dependencies.py` to extract `current_user` asynchronously using MongoDB's `PydanticObjectId`.
- [ ] **Deprecate SQLite File**: Remove `smart_vision.db`, delete SQLite connection setup, and remove `SQLAlchemy` from `backend/requirements.txt`.
- [ ] **Schema Integration Test**: Verify token generation, verification, rotation, and logout operations using Beanie ODM.

### Phase 2: Hardware Sensor Integrations & Speech Loop
* **Goal**: Finalize HC-SR04 ultrasonic distance tracking, vibration PWM feedback, and local voice loop.
- [ ] **HC-SR04 Sonar Driver Implementation**: Incorporate real distance calculation code in `iot/main.py` using `RPi.GPIO` trig/echo pin pulses.
- [ ] **PWM Haptic Motor Feedback**: Implement hardware Pulse Width Modulation (PWM) on GPIO Pin 18 to scale duty cycles based on distance (100% duty cycle under 1m, 40% under 2m, 0% above 2m).
- [ ] **Simulated Hardware Threading**: Refactor fallback loops so that the IoT client runs gracefully on Windows/macOS using simulated sensor inputs if GPIO registers fail.
- [ ] **Vosk & Whisper Offline Verification**: Downscale the local whisper model to `tiny` format and package the local `Vosk` small model in `iot/model` directory.
- [ ] **Fuzzy Intent Matching Expansion**: Expand intent patterns in `iot/intent_classifier.py` for all key commands (e.g., bus schedules, volunteer requests, SOS cancel).

### Phase 3: Real-Time Telemetry & WebRTC Matching
* **Goal**: Implement live WebSockets telemetry tracking and WebRTC volunteer signaling.
- [ ] **WebSocket Telemetry Stream**: Connect frontend live Leaflet map to `ws://localhost:8000/ws/iot` to plot pulsing coordinates of the user.
- [ ] **Battery & Connectivity Alerts**: Integrate visual warnings on the caregiver dashboard when battery drops below 20% or signal heartbeats are missed.
- [ ] **Geospatial Proximity Matchmaking**: Implement the MongoDB `$nearSphere` geospatial operator within the `HelpRequest` API flow to query active volunteers within 5km of a blind user.
- [ ] **WebRTC Video Signaling Server**: Build a signaling channel in FastAPI to establish WebRTC peer-to-peer visual feeds between matched blind users and volunteer browsers.

### Phase 4: Frontend Accessibility Certification
* **Goal**: Verify Accessibility Simple Mode for keyboard routing, screen-readers, and clear visual contrast.
- [ ] **Aria-Labels Audit**: Add semantic WCAG-compliant HTML5 tags and unique `id` properties to all interactive blocks on the dashboard and home page.
- [ ] **Keyboard Tab-index Flow**: Verify page structures support full keyboard navigation without mouse cursor dependency.
- [ ] **TTS Hover Synthesis**: Standardize hover audio announcements using the Web Speech API across all links and critical action panels.
- [ ] **Contrast Tuning**: Verify that colors in "Accessibility Simple Mode" maintain high visual contrast (e.g. pure yellow/black/white borders).

### Phase 5: Verification & Production Deployment
- [ ] **MongoDB TTL Verification**: Confirm the TTL index (`expireAfterSeconds: 2592000`) is active on the `iot_logs` collection to automatically clear old entries.
- [ ] **CI/CD Integration Pipeline**: Create GitHub actions to profile code quality and run automated PyTest files (`backend/test_db.py`).
- [ ] **Production Build Bundler**: Compile and optimize Vite static assets (`npm run build`).
