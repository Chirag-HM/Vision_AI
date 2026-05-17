"""
test_db.py
Smoke test: Connect to MongoDB Atlas, create one of each document, read it back.
Run with: python test_db.py
Requires MONGODB_URL in .env
"""

import asyncio
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()


async def main():
    from core.database import connect_db
    from models.user      import User, UserRole
    from models.token     import RefreshToken
    from models.device    import Device, SOSEvent, GeoPoint
    from models.volunteer import Volunteer, HelpRequest, HelpRequestStatus
    from models.caregiver import CaregiverLink
    from models.iot_log   import IotLog

    # ── 1. Connect ───────────────────────────────────────────────────────────
    document_models = [
        User, RefreshToken,
        Device, SOSEvent,
        Volunteer, HelpRequest,
        CaregiverLink, IotLog,
    ]
    await connect_db(document_models)
    print("\n✅ Connected to MongoDB Atlas\n")

    # ── 2. Create User ────────────────────────────────────────────────────────
    existing = await User.find_one(User.email == "testbot@smartvision.dev")
    if existing:
        await existing.delete()

    user = User(
        email="testbot@smartvision.dev",
        hashed_password="$2b$12$hashed_placeholder",
        role=UserRole.BLIND_USER,
        is_verified=True,
        full_name="Test Bot",
        phone="+91-9999999999",
        city="Bengaluru",
    )
    await user.insert()
    print(f"✅ User created:      {user.email} [{user.role}] → id={user.id}")

    # ── 3. Refresh Token ──────────────────────────────────────────────────────
    token = RefreshToken(
        user_id=user.id,
        token_hash="abc123fakehash",
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    await token.insert()
    print(f"✅ RefreshToken:      id={token.id}  user_id={token.user_id}")

    # ── 4. Device ─────────────────────────────────────────────────────────────
    dev = await Device.find_one(Device.device_id == "PI-001-TEST")
    if dev:
        await dev.delete()

    device = Device(
        user_id=user.id,
        device_id="PI-001-TEST",
        is_online=True,
        battery=87,
        location=GeoPoint.create(lat=12.9750, lng=77.6070),
    )
    await device.insert()
    print(f"✅ Device created:    {device.device_id}  battery={device.battery}%")

    # ── 5. SOS Event ──────────────────────────────────────────────────────────
    sos = SOSEvent(
        user_id=user.id,
        location=GeoPoint.create(lat=12.9750, lng=77.6070),
        notified_caregivers=[],
    )
    await sos.insert()
    print(f"✅ SOSEvent:          id={sos.id}  active={sos.is_active}")

    # ── 6. Volunteer ──────────────────────────────────────────────────────────
    vol = Volunteer(
        user_id=user.id,
        is_available=True,
        city="Bengaluru",
        skills=["Navigation", "Reading"],
        location=GeoPoint.create(lat=12.9755, lng=77.6075),
    )
    await vol.insert()
    print(f"✅ Volunteer:         id={vol.id}  skills={vol.skills}")

    # ── 7. Help Request ───────────────────────────────────────────────────────
    req = HelpRequest(
        requester_id=user.id,
        status=HelpRequestStatus.PENDING,
        request_type="Navigation to bus stop",
        location=GeoPoint.create(lat=12.9750, lng=77.6070),
    )
    await req.insert()
    print(f"✅ HelpRequest:       id={req.id}  status={req.status}")

    # ── 8. Caregiver Link ─────────────────────────────────────────────────────
    link = CaregiverLink(caregiver_id=user.id, user_id=user.id)
    await link.insert()
    print(f"✅ CaregiverLink:     caregiver={link.caregiver_id}  user={link.user_id}")

    # ── 9. IoT Log ────────────────────────────────────────────────────────────
    log = IotLog(
        device_id="PI-001-TEST",
        user_id=user.id,
        event="obstacle_detected",
        data={"distance_m": 0.8, "direction": "front"},
    )
    await log.insert()
    print(f"✅ IotLog:            event={log.event}  data={log.data}")

    # ── 10. Read back ─────────────────────────────────────────────────────────
    fetched_user = await User.find_one(User.email == "testbot@smartvision.dev")
    print(f"\n✅ Read-back User:    {fetched_user.email} verified={fetched_user.is_verified}")

    recent_logs = await IotLog.recent("PI-001-TEST", limit=5)
    print(f"✅ Recent logs:       {len(recent_logs)} log(s) found")

    print("\n🎉 All documents created and read back successfully!")

    # ── 11. Cleanup ───────────────────────────────────────────────────────────
    print("\n🧹 Cleaning up test data...")
    await user.delete()
    await token.delete()
    await device.delete()
    await sos.delete()
    await vol.delete()
    await req.delete()
    await link.delete()
    await log.delete()
    print("✅ Cleanup complete.")


if __name__ == "__main__":
    asyncio.run(main())
