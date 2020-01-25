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


def get_user_route(db: Database, user_id: ObjectId, route_id: str):
    doc = db[ROUTES].find_one({"_id": ObjectId(route_id)})
    if doc is None:
        return None
    if doc["uid"] == user_id or doc["public"]:
        return {
            "id": str(doc["_id"]),
            "name": doc["name"],
            "public": doc["public"],
            "waypoints": doc["waypoints"],
        }
    return None


def edit_user_route(
        db: Database,
        user_id: ObjectId,
        route_id: str,
        name: str,
        waypoints: List[Tuple[str, str]],
        public: bool,
):
    res = db[ROUTES].update_one(
        {"_id": ObjectId(route_id), "uid": user_id},
        {"$set": {
            "public": public,
            "name": name,
            "waypoints": waypoints,
        }},
    )
    if res is None:
        raise DatabaseError()


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
    route = res.get("route")
    return {
        "year": year,
        "sums": res.get("sums", {}),
        "weekly": res.get("weekly", {}),
        "route": None if route is None else str(route),
    }


def get_user_total_goal(db: Database, user_id: ObjectId):
    res = db[USER_GOALS].find_one({"uid": user_id, "year": "total"})
    if res is None:
        return None
    route = res.get("route")
    return {
        "year": "total",
        "sums": None,
        "weekly": None,
        "route": None if route is None else str(route),
    }


def upsert_user_total_goal(
        db: Database,
        user_id: ObjectId,
        route: Optional[str],
):
    return db[USER_GOALS].update_one(
        {"uid": user_id, "year": "total"},
        {"$set": {
            "route": None if route is None else ObjectId(route),
        }},
        upsert=True,
    )


def upsert_user_goal(
    db: Database,
    user_id: ObjectId,
    year: int,
    sums: Dict[str, Union[int, float, None]],
    weekly: Dict[str, Union[int, float, None]],
    route: Optional[str],
):
    return db[USER_GOALS].update_one(
        {"uid": user_id, "year": year},
        {"$set": {
            "year": year,
            "sums": sums,
            "weekly": weekly,
            "route": None if route is None else ObjectId(route),
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
    event_id: str,
    user_id: ObjectId,
    date: str,
    summary: Dict[str, float],
):
    res = db[EVENTS_COLLECTION].update_one(
        {'_id': ObjectId(event_id), "uid": user_id},
        {'$set': {
            "date": dt.datetime.strptime(date[:10], "%Y-%m-%d"),
            "summary": summary,
        }}
    )
    if res is None:
        raise DatabaseError()
    return str(res)


def delete_event(db: Database, event_id: str, user_id: ObjectId):
    res = db[EVENTS_COLLECTION].delete_one({'_id': ObjectId(event_id), "uid": user_id})
    if res is None:
        raise DatabaseError()
    return str(res)
