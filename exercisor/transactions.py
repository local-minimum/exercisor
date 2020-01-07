import datetime as dt
from typing import Dict, Optional, Union

from pymongo.database import Database
from pymongo import DESCENDING
from bson.objectid import ObjectId

from .exceptions import DatabaseError

EVENTS_COLLECTION = 'events'
USER_SETTINGS = 'users'
USER_GOALS = 'goals'


def get_user_goal(db: Database, user: str, year: int):
    res = db[USER_GOALS].find_one({"user": user, "year": year})
    if res is None:
        return None
    return {
        "user": user,
        "year": year,
        "sums": res["sums"],
    }


def upsert_user_goal(db: Database, user: str, year: int, sums: Dict[str, Union[int, float]]):
    return db[USER_GOALS].update_one(
        {"user": user, "year": year},
        {"$set": {
            "user": user,
            "year": year,
            "sums": sums,
        }},
        upsert=True,
    )


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
    return str(res)


def get_all_summaries(db: Database, user: str):
    return [
        {
            "id": str(doc["_id"]),
            "date": doc['date'].date().isoformat(),
            "calories": doc.get("summary", {}).get("calories"),
            "distance": doc.get("summary", {}).get("distance"),
            "duration": doc.get("summary", {}).get("duration"),
            "type": doc.get("summary", {}).get("type", "CrossTrainer"),
        } for doc in db[EVENTS_COLLECTION].find({"user": user}).sort("date", DESCENDING)
    ]


def add_summary(
    db: Database,
    user: str,
    user_id: ObjectId,
    date: str,
    summary: Dict[str, float],
):
    res = db[EVENTS_COLLECTION].insert_one({
        "user": user,
        "uid": user_id,
        "date": dt.datetime.strptime(date[:10], "%Y-%m-%d"),
        "summary": summary,
    })
    if res is None:
        raise DatabaseError()
    return str(res)


def edit_event(
    db: Database,
    doc_id: str,
    user: str,
    user_id: ObjectId,
    date: str,
    summary: Dict[str, float],
):
    res = db[EVENTS_COLLECTION].update_one(
        {'_id': ObjectId(doc_id), "user": user},
        {'$set': {
            "uid": user_id,
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
