import datetime as dt
from typing import Dict, Optional, Union, List, Tuple

from pymongo.database import Database
from pymongo import DESCENDING
from bson.objectid import ObjectId

from .exceptions import DatabaseError

EVENTS_COLLECTION = 'events'
USER_SETTINGS = 'users'
USER_GOALS = 'goals'
ROUTES = 'routes'


def get_public_routes(db: Database):
    return [
        {
            "id": str(doc["_id"]),
            "name": doc["name"],
            "public": doc["public"],
            "waypoints": doc["waypoints"],
        }
        for doc in db[ROUTES].find({"public": True})
    ]


def get_user_routes(db: Database, user_id: ObjectId):
    return [
        {
            "id": str(doc["_id"]),
            "name": doc["name"],
            "public": doc["public"],
            "waypoints": doc["waypoints"],
        }
        for doc in db[ROUTES].find({"uid": user_id})
    ]


def put_user_route(
        db: Database,
        user_id: ObjectId,
        name: str,
        waypoints: List[Tuple[str, str]],
        public: bool,
):
    res = db[ROUTES].insert_one({
        "uid": user_id,
        "public": public,
        "name": name,
        "waypoints": waypoints,
    })
    if res is None:
        raise DatabaseError()
    return str(res.inserted_id)


def get_user_goal(db: Database, user_id: ObjectId, year: int):
    res = db[USER_GOALS].find_one({"uid": user_id, "year": year})
    if res is None:
        return None
    return {
        "year": year,
        "sums": res.get("sums", {}),
        "weekly": res.get("weekly", {}),
    }


def upsert_user_goal(
    db: Database,
    user_id: ObjectId,
    year: int,
    sums: Dict[str, Union[int, float, None]],
    weekly: Dict[str, Union[int, float, None]],
):
    return db[USER_GOALS].update_one(
        {"uid": user_id, "year": year},
        {"$set": {
            "year": year,
            "sums": sums,
            "weekly": weekly,
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
    return str(res.inserted_id)


def get_all_summaries(db: Database, user_id: ObjectId):
    return [
        {
            "id": str(doc["_id"]),
            "date": doc['date'].date().isoformat(),
            "calories": doc.get("summary", {}).get("calories"),
            "distance": doc.get("summary", {}).get("distance"),
            "duration": doc.get("summary", {}).get("duration"),
            "type": doc.get("summary", {}).get("type", "CrossTrainer"),
        } for doc in db[EVENTS_COLLECTION].find({"uid": user_id}).sort("date", DESCENDING)
    ]


def add_summary(
    db: Database,
    user_id: ObjectId,
    date: str,
    summary: Dict[str, float],
):
    res = db[EVENTS_COLLECTION].insert_one({
        "uid": user_id,
        "date": dt.datetime.strptime(date[:10], "%Y-%m-%d"),
        "summary": summary,
    })
    if res is None:
        raise DatabaseError()
    return str(res.inserted_id)


def edit_event(
    db: Database,
    doc_id: str,
    user_id: ObjectId,
    date: str,
    summary: Dict[str, float],
):
    res = db[EVENTS_COLLECTION].update_one(
        {'_id': ObjectId(doc_id), "uid": user_id},
        {'$set': {
            "date": dt.datetime.strptime(date[:10], "%Y-%m-%d"),
            "summary": summary,
        }}
    )
    if res is None:
        raise DatabaseError()
    return str(res)


def delete_event(db: Database, doc_id: str, user_id: ObjectId):
    res = db[EVENTS_COLLECTION].delete_one({'_id': ObjectId(doc_id), "uid": user_id})
    if res is None:
        raise DatabaseError()
    return str(res)
