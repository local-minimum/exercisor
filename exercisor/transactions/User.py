from typing import Optional

from pymongo.database import Database
from bson.objectid import ObjectId

from ..exceptions import DatabaseError

USER_SETTINGS = 'users'


def get_user_settings(db: Database, user_id: ObjectId):
    res = db[USER_SETTINGS].find_one({"_id": user_id})
    if res is None:
        raise DatabaseError("Doesn't exist")
    return {
        "edit-key-hash": res.get('edit'),
        "public": bool(res.get('public', False)),
    }


def get_user_id(db: Database, user: str) -> Optional[ObjectId]:
    res = db[USER_SETTINGS].find_one({"user": user})
    if res is None:
        return None
    return res["_id"]


def add_user(db: Database, user: str, edit_hash: Optional[str], public: Optional[bool]):
    if db[USER_SETTINGS].find_one({"user": user}):
        raise DatabaseError("Already taken")
    res = db[USER_SETTINGS].insert_one({
        "user": user,
        "edit": edit_hash,
        "public": public,
    })
    return str(res.inserted_id)
