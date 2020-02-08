import datetime as dt
from typing import Dict

from pymongo.database import Database
from pymongo import DESCENDING
from bson.objectid import ObjectId

from ..exceptions import DatabaseError

EVENTS_COLLECTION = 'events'


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
