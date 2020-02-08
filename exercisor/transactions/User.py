import datetime as dt
from typing import Optional
from uuid import uuid4
from hashlib import sha512

from flask_login import LoginManager, UserMixin
from pymongo.database import Database
from bson.objectid import ObjectId
import bcrypt

from ..exceptions import DatabaseError

USER_SETTINGS = 'users'


class UserStatus(UserMixin):
    def __init__(self, uid: Optional[ObjectId] = None, session: Optional[str] = None):
        super().__init__()
        self._session_hash = session if session else str(uuid4())
        self._uid = uid

    @property
    def is_authenticated(self):
        return self._uid is not None

    @property
    def is_active(self):
        return self._uid is not None

    @property
    def is_anonymous(self):
        return False

    def get_id(self) -> str:
        return self._session_hash

    @property
    def uid(self) -> ObjectId:
        return self._uid


def user_loader_setup(login_manager: LoginManager, db: Database):
    @login_manager.user_loader
    def user_loader(session_hash: str) -> Optional[UserStatus]:
        return get_user_status_from_session(db, session_hash)


def get_public_user(db: Database, user_id: ObjectId):
    res = db[USER_SETTINGS].find_one({"_id": user_id})
    if res is None:
        raise DatabaseError("Doesn't exist")
    return bool(res.get('public', False))


def get_user_id(db: Database, user: str) -> Optional[ObjectId]:
    res = db[USER_SETTINGS].find_one({"user": user})
    if res is None:
        return None
    return res["_id"]


def get_user_status_from_session(db: Database, session_hash: str) -> Optional[UserStatus]:
    if not session_hash:
        return None

    res = db[USER_SETTINGS].find_one({
        "session": session_hash,
        "lastseen": {"$gt": {dt.datetime.utcnow() - dt.timedelta(days=7)}},
    })
    if res is None:
        return None
    db[USER_SETTINGS].update_one(
        {"session": session_hash},
        {"$set": {"last-seen": dt.datetime.utcnow()}},
    )
    return UserStatus(
        res["_id"],
        res["session"],
    )


def legacy_password(pwd: Optional[str]) -> Optional[str]:
    if pwd is None:
        return None
    m = sha512()
    m.update(pwd.encode())
    return m.hexdigest()


def migrate_legacy_password(db: Database, uid: ObjectId, password: str):
    db[USER_SETTINGS].update_one(
        {"_id": uid},
        {"$set": {
            "password": bcrypt.hashpw(password, bcrypt.gensalt()),
            "edit": None,
        }},
    )


def start_user_session(db: Database, user: str, password: str) -> Optional[UserStatus]:
    doc = db[USER_SETTINGS].find_one({"user": user})
    if not doc:
        return None
    if "password" not in doc:
        if legacy_password(password) != doc["edit"]:
            return None
        migrate_legacy_password(db, doc["_id"], password)
    elif not bcrypt.checkpw(password, doc["password"]):
        return None
    user_status = UserStatus(doc["_id"])
    db[USER_SETTINGS].update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "session": user_status.get_id(),
            "last-seen": dt.datetime.utcnow(),
        }},
    )
    return user_status


def end_user_session(db: Database, user: UserStatus):
    res = db[USER_SETTINGS].update_one(
        {"_id", user.uid},
        {"session": None},
    )
    return res.modified_count == 1


def add_user(db: Database, user: str, password: str, public: Optional[bool]):
    if db[USER_SETTINGS].find_one({"user": user}):
        raise DatabaseError("Already taken")
    res = db[USER_SETTINGS].insert_one({
        "user": user,
        "password": bcrypt.hashpw(password, bcrypt.gensalt()),
        "public": public,
    })
    return str(res.inserted_id)
