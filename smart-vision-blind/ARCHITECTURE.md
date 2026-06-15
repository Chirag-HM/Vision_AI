# Smart Vision IoT Platform - Architecture & Overview

This document provides a comprehensive breakdown of the architecture, tech stack, database schema, and relationships for the **Smart Vision IoT platform**.

## 🏗️ Project Architecture & Tech Stack

This project is divided into two main components: a **FastAPI backend** and a **React/Vite frontend**, specifically designed to assist blind users and connect them with caregivers and volunteers.

### 🛠️ Backend (Python / FastAPI)
- **Framework:** **FastAPI** (v0.110.0) running on **Uvicorn**.
- **Database:** **MongoDB**. It uses **Beanie ODM** (Object Document Mapper) on top of **Motor** for asynchronous database operations.
- **Authentication:** **JWT-based** authentication using `python-jose` and password hashing with `bcrypt` / `passlib`.
- **Real-time Data:** Native **WebSockets** to handle real-time streaming of IoT sensor data, SOS alerts, and location updates.

### 🎨 Frontend (React / Vite)
- **Framework:** **React 19** with **TypeScript**, bundled using **Vite**.
- **Styling:** **Tailwind CSS v4** combined with **Lucide React** for icons.
- **Routing:** **React Router v7**.
- **State & Data Fetching:** **Axios** for REST API calls and **Socket.io-client** for WebSocket subscriptions.
- **Interactive Visuals & Mapping:**
  - **Three.js** (`@react-three/fiber`, `@react-three/drei`) for 3D rendering.
  - **Framer Motion** and **GSAP** for advanced UI animations.
  - **Leaflet** (`react-leaflet`) and **Mapbox** for real-time map tracking (useful for caregivers tracking users).

---

## 🗄️ Database Schema & Relationships (MongoDB/Beanie)

The backend models are strictly typed via Pydantic and mapped to MongoDB collections via Beanie. Here are the core entities and their relationships:

### 1. `users` (User Model)
The central entity for all platform participants.
- **Fields:** `email`, `hashed_password`, `role`, `is_verified`, `full_name`, `phone`, `city`, `created_at`, `updated_at`.
- **Roles:** Defined via an Enum (`BLIND_USER`, `CAREGIVER`, `VOLUNTEER`, `ADMIN`).

### 2. `devices` (Device Model)
Represents the physical IoT hardware used by the blind user.
- **Fields:** `user_id`, `device_id` (unique hardware ID), `is_online`, `battery`, `location`, `last_seen`.
- **Location:** Uses **GeoJSON Point** format (`{type: "Point", coordinates: [lng, lat]}`) which is indexed using MongoDB's `2dsphere` to allow fast geospatial queries.
- **Relation:** Belongs to one `user_id` (a `BLIND_USER`).

### 3. `caregiver_links` (CaregiverLink Model)
Acts as a mapping table to connect a caregiver to a blind user.
- **Fields:** `caregiver_id` (User ID of the caregiver), `user_id` (User ID of the blind user), `linked_at`.
- **Relation:** A many-to-many link allowing one caregiver to monitor multiple blind users, and one blind user to have multiple caregivers.

### 4. `sos_events` (SOSEvent Model)
Triggered when the blind user activates an emergency alert.
- **Fields:** `user_id` (The blind user in distress), `location` (GeoJSON coordinates of the incident), `triggered_at`, `cancelled_at`, `is_active`, `notified_caregivers` (Array of Caregiver User IDs).
- **Relation:** Connects the `BLIND_USER` to the specific `CAREGIVER`s who were alerted.

### 5. `iot_logs` (IotLog Model)
A high-volume time-series collection that records telemetry from the IoT device.
- **Fields:** `device_id`, `user_id`, `event` (e.g., `"obstacle_detected"`, `"voice_command"`), `data` (a flexible JSON payload), `timestamp`.
- **Indexes:** Includes a Compound Index for fast queries by device over time, and a **TTL (Time-To-Live) Index** which tells MongoDB to automatically delete logs older than 30 days to save storage space.

---

## 🔗 How everything ties together
1. A `BLIND_USER` registers and pairs a physical `Device` to their account.
2. The hardware sends continuous telemetry data (`IotLog`) and real-time location via WebSockets.
3. A `CAREGIVER` registers and is linked to the `BLIND_USER` via the `CaregiverLink` collection.
4. If an obstacle is too close or the user needs help, an `SOSEvent` is generated, which queries the `caregiver_links` and broadcasts real-time alerts to the caregiver's React dashboard.
