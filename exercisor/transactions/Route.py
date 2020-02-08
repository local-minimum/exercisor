from typing import List, Tuple

from bson.objectid import ObjectId
from pymongo.database import Database

from ..exceptions import DatabaseError

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
