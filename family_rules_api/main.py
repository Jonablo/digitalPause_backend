from datetime import datetime, timedelta, timezone
from typing import Optional, Literal, Dict, Any

from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine, Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# ----------------------------
# DB (SQLite para demo rápida)
# ----------------------------
DATABASE_URL = "sqlite:///./family_rules.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def utcnow():
    return datetime.now(timezone.utc)

# ----------------------------
# Modelos DB
# ----------------------------
class ChildProfile(Base):
    __tablename__ = "child_profiles"
    id = Column(String, primary_key=True)  # UUID string (lo generamos simple)
    child_name = Column(String, nullable=False)
    device_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

class ParentChildLink(Base):
    __tablename__ = "parent_child_link"
    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_user_id = Column(String, nullable=False, unique=True)  # 1 hijo por padre
    child_profile_id = Column(String, ForeignKey("child_profiles.id"), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    child = relationship("ChildProfile")

class Rules(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True, autoincrement=True)
    child_profile_id = Column(String, ForeignKey("child_profiles.id"), nullable=False, unique=True)
    enabled = Column(Boolean, default=True, nullable=False)

    continuous_use_limit_min = Column(Integer, default=90, nullable=False)
    forced_break_min = Column(Integer, default=10, nullable=False)

    # RF-18 config
    accel_enabled = Column(Boolean, default=True, nullable=False)
    taps_window_sec = Column(Integer, default=10, nullable=False)
    taps_threshold = Column(Integer, default=25, nullable=False)
    screen_changes_window_sec = Column(Integer, default=60, nullable=False)
    screen_changes_threshold = Column(Integer, default=12, nullable=False)
    suggested_pause_min = Column(Integer, default=5, nullable=False)

    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

class InteractionEvent(Base):
    __tablename__ = "interaction_events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    child_profile_id = Column(String, ForeignKey("child_profiles.id"), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)
    event_type = Column(String, nullable=False)  # TAP_BURST | SCREEN_CHANGE
    data = Column(JSON, nullable=True)

class PauseEvent(Base):
    __tablename__ = "pause_events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    child_profile_id = Column(String, ForeignKey("child_profiles.id"), nullable=False)
    ts = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    pause_type = Column(String, nullable=False)  # SUGGESTED
    reason = Column(String, nullable=False)      # ACCEL_PATTERN
    pause_min = Column(Integer, nullable=False)
    message = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# ----------------------------
# Schemas API
# ----------------------------
def gen_id(prefix: str) -> str:
    # ID simple para demo (puedes cambiar a uuid4)
    return f"{prefix}_{int(datetime.now().timestamp() * 1000)}"

class ChildInput(BaseModel):
    child_name: str = Field(min_length=1)
    device_id: Optional[str] = None

class LinkChildRequest(BaseModel):
    parent_user_id: str = Field(min_length=1)
    child: ChildInput

class LinkChildResponse(BaseModel):
    parent_user_id: str
    child_profile_id: str
    status: str

class AccelConfig(BaseModel):
    enabled: bool = True
    taps_window_sec: int = 10
    taps_threshold: int = 25
    screen_changes_window_sec: int = 60
    screen_changes_threshold: int = 12
    suggested_pause_min: int = 5

class RulesRequest(BaseModel):
    enabled: bool = True
    continuous_use_limit_min: int = 90
    forced_break_min: int = 10
    accel: AccelConfig = AccelConfig()

class RulesResponse(BaseModel):
    child_profile_id: str
    rules_version: int
    updated_at: str

EventType = Literal["TAP_BURST", "SCREEN_CHANGE"]

class InteractionEventRequest(BaseModel):
    child_profile_id: str
    timestamp: str  # ISO string
    event_type: EventType
    data: Dict[str, Any] = {}

class InteractionEventResponse(BaseModel):
    action: Literal["NONE", "SUGGESTED_PAUSE"]
    reason: Optional[str] = None
    pause_min: Optional[int] = None
    message: Optional[str] = None

# ----------------------------
# App
# ----------------------------
app = FastAPI(title="Family Rules API (RF-03, RF-04, RF-18)")

@app.get("/health")
def health():
    return {"status": "ok", "time": utcnow().isoformat()}

# RF-03
@app.post("/family/link-child", response_model=LinkChildResponse)
def link_child(payload: LinkChildRequest):
    db = SessionLocal()
    try:
        existing = db.query(ParentChildLink).filter_by(parent_user_id=payload.parent_user_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="PARENT_ALREADY_HAS_CHILD")

        child_id = gen_id("child")
        child = ChildProfile(
            id=child_id,
            child_name=payload.child.child_name,
            device_id=payload.child.device_id
        )
        db.add(child)
        db.flush()

        link = ParentChildLink(parent_user_id=payload.parent_user_id, child_profile_id=child_id)
        db.add(link)

        # Crear reglas por defecto (opcional pero útil)
        rules = Rules(child_profile_id=child_id)
        db.add(rules)

        db.commit()
        return LinkChildResponse(parent_user_id=payload.parent_user_id, child_profile_id=child_id, status="linked")
    finally:
        db.close()

# RF-04
@app.put("/family/rules/{child_profile_id}", response_model=RulesResponse)
def upsert_rules(child_profile_id: str = Path(...), payload: RulesRequest = None):
    db = SessionLocal()
    try:
        child = db.query(ChildProfile).filter_by(id=child_profile_id).first()
        if not child:
            raise HTTPException(status_code=404, detail="CHILD_NOT_FOUND")

        rules = db.query(Rules).filter_by(child_profile_id=child_profile_id).first()
        if not rules:
            rules = Rules(child_profile_id=child_profile_id)
            db.add(rules)

        rules.enabled = payload.enabled
        rules.continuous_use_limit_min = payload.continuous_use_limit_min
        rules.forced_break_min = payload.forced_break_min

        rules.accel_enabled = payload.accel.enabled
        rules.taps_window_sec = payload.accel.taps_window_sec
        rules.taps_threshold = payload.accel.taps_threshold
        rules.screen_changes_window_sec = payload.accel.screen_changes_window_sec
        rules.screen_changes_threshold = payload.accel.screen_changes_threshold
        rules.suggested_pause_min = payload.accel.suggested_pause_min

        db.commit()

        # rules_version: demo simple (si quieres, guarda un contador real)
        return RulesResponse(
            child_profile_id=child_profile_id,
            rules_version=1,
            updated_at=utcnow().isoformat()
        )
    finally:
        db.close()

# RF-18
@app.post("/events/interaction", response_model=InteractionEventResponse)
def interaction_event(payload: InteractionEventRequest):
    db = SessionLocal()
    try:
        # validar child
        child = db.query(ChildProfile).filter_by(id=payload.child_profile_id).first()
        if not child:
            raise HTTPException(status_code=404, detail="CHILD_NOT_FOUND")

        # reglas
        rules = db.query(Rules).filter_by(child_profile_id=payload.child_profile_id).first()
        if not rules or not rules.enabled:
            return InteractionEventResponse(action="NONE")

        # parse timestamp
        try:
            ts = datetime.fromisoformat(payload.timestamp.replace("Z", "+00:00"))
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
        except Exception:
            raise HTTPException(status_code=400, detail="INVALID_TIMESTAMP_ISO")

        # guardar evento
        ev = InteractionEvent(
            child_profile_id=payload.child_profile_id,
            ts=ts,
            event_type=payload.event_type,
            data=payload.data
        )
        db.add(ev)
        db.commit()

        # evaluar patrón acelerado
        if not rules.accel_enabled:
            return InteractionEventResponse(action="NONE")

        # Caso 1: TAP_BURST
        if payload.event_type == "TAP_BURST":
            count = int(payload.data.get("count", 0))
            window_sec = int(payload.data.get("window_sec", 999999))
            if window_sec <= rules.taps_window_sec and count >= rules.taps_threshold:
                pe = PauseEvent(
                    child_profile_id=payload.child_profile_id,
                    pause_type="SUGGESTED",
                    reason="ACCEL_PATTERN",
                    pause_min=rules.suggested_pause_min,
                    message="Se detectó uso acelerado. Toma una pausa corta."
                )
                db.add(pe)
                db.commit()
                return InteractionEventResponse(
                    action="SUGGESTED_PAUSE",
                    reason="ACCEL_PATTERN",
                    pause_min=rules.suggested_pause_min,
                    message=pe.message
                )
            return InteractionEventResponse(action="NONE")

        # Caso 2: SCREEN_CHANGE (conteo en ventana)
        if payload.event_type == "SCREEN_CHANGE":
            window_start = ts - timedelta(seconds=rules.screen_changes_window_sec)
            changes = db.query(InteractionEvent).filter(
                InteractionEvent.child_profile_id == payload.child_profile_id,
                InteractionEvent.event_type == "SCREEN_CHANGE",
                InteractionEvent.ts >= window_start,
                InteractionEvent.ts <= ts
            ).count()

            if changes >= rules.screen_changes_threshold:
                pe = PauseEvent(
                    child_profile_id=payload.child_profile_id,
                    pause_type="SUGGESTED",
                    reason="ACCEL_PATTERN",
                    pause_min=rules.suggested_pause_min,
                    message="Se detectó uso acelerado por cambios constantes. Toma una pausa."
                )
                db.add(pe)
                db.commit()
                return InteractionEventResponse(
                    action="SUGGESTED_PAUSE",
                    reason="ACCEL_PATTERN",
                    pause_min=rules.suggested_pause_min,
                    message=pe.message
                )

            return InteractionEventResponse(action="NONE")

        return InteractionEventResponse(action="NONE")
    finally:
        db.close()
