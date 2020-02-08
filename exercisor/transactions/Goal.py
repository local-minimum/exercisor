from typing import Dict, Optional, Union

from pymongo.database import Database
from bson.objectid import ObjectId

USER_GOALS = 'goals'


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
        return {
            "year": "total",
            "sums": None,
            "weekly": None,
            "route": None,
        }
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
            "route": None if not route else ObjectId(route),
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
            "route": None if not route else ObjectId(route),
        }},
        upsert=True,
    )
