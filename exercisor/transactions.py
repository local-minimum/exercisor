import datetime as dt
from typing import Dict, Optional

from pymongo.database import Database
from pymongo import DESCENDING
from bson.objectid import ObjectId

from .exceptions import DatabaseError

EVENTS_COLLECTION = 'events'
USER_SETTINGS = 'users'


def get_user_settings(db: Database, user: str):
    res = db[USER_SETTINGS].find_one({"user": user})
    if res is None:
        raise DatabaseError("Doesn't exist")
    return {
        "edit-key-hash": res.get('edit'),
        "public": bool(res.get('public', False)),
    }


def add_user(db: Database, user: str, edit_hash: Optional[str], public: Optional[bool]):
    if db[USER_SETTINGS].find_one({"user": user}):
        raise DatabaseError("Already taken")
    res = db[USER_SETTINGS].insert_one({
        "user": user,
        "edit": edit_hash,
        "public": public,
    })
    return str(res)


def get_all_summaries(db: Database, user: str):
    return [
        {
            "id": str(doc["_id"]),
            "user": doc["user"],
            "date": doc['date'].date().isoformat(),
            "calories": doc.get("summary", {}).get("calories"),
            "distance": doc.get("summary", {}).get("distance"),
            "duration": doc.get("summary", {}).get("duration"),
        } for doc in db[EVENTS_COLLECTION].find({"user": user}).sort("date", DESCENDING)
    ]


def add_summary(db: Database, user: str, date: str, summary: Dict[str, float]):
    res = db[EVENTS_COLLECTION].insert_one({
        "user": user,
        "date": dt.datetime.strptime(date[:10], "%Y-%m-%d"),
        "summary": summary,
    })
    if res is None:
        raise DatabaseError()
    return str(res)


def edit_event(db: Database, doc_id: str, user: str, date: str, summary: Dict[str, float]):
    res = db[EVENTS_COLLECTION].update_one(
        {'_id': ObjectId(doc_id), "user": user},
        {'$set': {
            "date": dt.datetime.strptime(date[:10], "%Y-%m-%d"),
            "summary": summary,
        }}
    )
    if res is None:
        raise DatabaseError()
    return str(res)


def delete_event(db: Database, doc_id: str, user: str):
    res = db[EVENTS_COLLECTION].delete_one({'_id': ObjectId(doc_id), "user": user})
    if res is None:
        raise DatabaseError()
    return str(res)
