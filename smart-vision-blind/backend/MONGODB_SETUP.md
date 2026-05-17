# MongoDB Atlas Setup Guide for Smart Vision

## Prerequisites
- A free MongoDB Atlas account (mongodb.com/atlas)

## Step 1: Create a Free Cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create an account.
2. Click **"Build a Database"** → Select **"Free (M0)"** tier.
3. Choose your cloud provider and region (e.g., AWS → Mumbai for India latency).
4. Name your cluster (e.g., `SmartVisionCluster`).
5. Click **"Create"** and wait ~2 minutes for provisioning.

## Step 2: Create a Database User
1. In the left sidebar, click **Security → Database Access**.
2. Click **"Add New Database User"**.
3. Choose **"Password"** authentication.
4. Enter a username (e.g., `smartvision_app`) and a strong password.
5. Set role to **"Read and write to any database"**.
6. Click **"Add User"**.

## Step 3: Allow Network Access
1. In the left sidebar, click **Security → Network Access**.
2. Click **"Add IP Address"**.
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`) — for development only.
4. In production, add only your server's specific IP address.
5. Click **"Confirm"**.

## Step 4: Get Your Connection String
1. In the left sidebar, click **Deployment → Database**.
2. Click **"Connect"** on your cluster.
3. Choose **"Drivers"** → Driver: **Python** → Version: **4.x or later**.
4. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@smartvisioncluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials.
6. Add `/smartvision` before the `?` to specify the database name:
   ```
   mongodb+srv://smartvision_app:yourpassword@smartvisioncluster.xxxxx.mongodb.net/smartvision?retryWrites=true&w=majority
   ```

## Step 5: Configure Your .env File
Copy `.env.example` to `.env` and fill in your connection string:
```bash
cp .env.example .env
```
Edit `.env`:
```env
MONGODB_URL=mongodb+srv://smartvision_app:yourpassword@smartvisioncluster.xxxxx.mongodb.net/smartvision?retryWrites=true&w=majority
DATABASE_NAME=smartvision
```

## Step 6: Install Dependencies
```bash
pip install -r requirements.txt
```

## Step 7: Test the Connection
```bash
python test_db.py
```
Expected output:
```
✅ Connected to MongoDB Atlas
✅ User created:      testbot@smartvision.dev [BLIND_USER]
✅ RefreshToken:      id=...
✅ Device created:    PI-001-TEST  battery=87%
...
🎉 All documents created and read back successfully!
✅ Cleanup complete.
```

## Step 8: Enable TTL Index for IoT Logs
After first connecting, run this once in MongoDB Atlas Shell or Compass to enable auto-deletion of old logs:
```javascript
db.iot_logs.createIndex({"timestamp": 1}, {expireAfterSeconds: 2592000})
```
This automatically deletes sensor logs older than **30 days**.

## Step 9: Start the Server
```bash
python -m uvicorn main:app --reload
```
Navigate to `http://localhost:8000/docs` to see the full API documentation.

## MongoDB Collections Created

| Collection | Purpose |
|---|---|
| `users` | User accounts (all roles) |
| `refresh_tokens` | JWT refresh token blacklist |
| `devices` | Smart stick device state + GPS |
| `sos_events` | Emergency SOS events |
| `volunteers` | Volunteer profiles + location |
| `help_requests` | Real-time assistance requests |
| `caregiver_links` | Caregiver ↔ User linkage |
| `iot_logs` | Sensor events (TTL 30 days) |

## Geospatial Features
The `devices` and `volunteers` collections use **2dsphere indexes** enabling MongoDB geospatial queries:
- Find the nearest available volunteer within 5km
- Find nearby bus stops
- Calculate distance between two GPS coordinates
