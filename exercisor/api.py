import os
from functools import lru_cache
from http import HTTPStatus
from hashlib import sha512
from typing import Optional

from flask_restful import Resource, abort, reqparse
from pymongo import MongoClient

from .transactions import User, Route, Goal, Event
from .exceptions import DatabaseError, IllegalEventType


@lru_cache(1)
def db():
    client = MongoClient(
        os.environ.get("EXERCISOR_MONGO_HOST", "localhost"),
        int(os.environ.get("EXERCISOR_MONGO_PORT", "27017")),
    )
    return client[os.environ.get("EXERCISOR_MONGO_DB", "exercisor")]


list_parser = reqparse.RequestParser()
list_parser.add_argument("edit-key", type=str, default=None)
list_parser.add_argument("date", type=str, help="Event date")
list_parser.add_argument("calories", type=int, default=None)
list_parser.add_argument("duration", type=float, default=None, help="In minutes")
list_parser.add_argument("distance", type=float, default=None)
list_parser.add_argument("type", type=str, default="CrossTrainer")

view_parser = reqparse.RequestParser()
view_parser.add_argument("edit-key", type=str, default=None)

ACCEPTED_EVENT_TYPES = ["CrossTrainer", "Running", "Walking", "Hiking", "Golfing", "Biking"]


def get_summary(args):
    if args['type'] not in ACCEPTED_EVENT_TYPES:
        raise IllegalEventType(f"{args['type']} inte tillåtet som motionstyp.")

    return {
        "calories": args['calories'],
        "duration": args['duration'],
        "distance": args['distance'],
        "type": args['type'],
    }


class ListRoutes(Resource):
    def get(self):
        return Route.get_public_routes(db())


user_parser = reqparse.RequestParser()
user_parser.add_argument("user", type=str)
user_parser.add_argument("edit-key", type=str, default=None)
user_parser.add_argument("public", type=int, default=1)


def pwd_hash(pwd: Optional[str]) -> Optional[str]:
    if pwd is None:
        return None
    m = sha512()
    m.update(pwd.encode())
    return m.hexdigest()


class ListUser(Resource):
    def put(self):
        args = user_parser.parse_args()
        if not args["user"]:
            abort(HTTPStatus.BAD_REQUEST.value, message="Användarnamn är ett måster")
        if not args["edit-key"]:
            abort(HTTPStatus.BAD_REQUEST.value, message="Lösenord är ett måste")
        try:
            User.add_user(
                db(),
                args["user"],
                pwd_hash(args["edit-key"]),
                bool(args["public"]),
            )
        except DatabaseError:
            abort(HTTPStatus.FORBIDDEN.value, message="Användarnamn redan taget")
        return {}


def may_view(uid, edit_key):
    try:
        settings = User.get_user_settings(db(), uid)
    except DatabaseError:
        abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
    else:
        if settings['public']:
            return True
        return pwd_hash(edit_key) == settings['edit-key-hash']
    return False


def may_edit(uid, edit_key):
    try:
        settings = User.get_user_settings(db(), uid)
    except DatabaseError:
        abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
    else:
        return pwd_hash(edit_key) == settings['edit-key-hash']
    return False


goals_parser = reqparse.RequestParser()
goals_parser.add_argument("edit-key", type=str, default=None)
goals_parser.add_argument("sum-events", type=int, default=None, help="Total number of events this year")
goals_parser.add_argument("weekly-dist", type=float, default=None, help="Genomsnittsavstånd per vecka")
goals_parser.add_argument("route", type=str, default=None, help="Rutt id för rutt på kartan")


class UserTotalGoals(Resource):
    def get(self, user: str):
        uid = User.get_user_id(db(), user)
        if may_view(uid, view_parser.parse_args()['edit-key']):
            return Goal.get_user_total_goal(db(), uid)
        abort(HTTPStatus.FORBIDDEN.value, message="Denna användare är privat")

    def post(self, user: str):
        uid = User.get_user_id(db(), user)
        args = goals_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        Goal.upsert_user_total_goal(
            db(),
            uid,
            args["route"],
        )
        return {}


class UserYearGoals(Resource):
    def get(self, user: str, year: int):
        uid = User.get_user_id(db(), user)
        if may_view(uid, view_parser.parse_args()['edit-key']):
            return Goal.get_user_goal(db(), uid, year)
        abort(HTTPStatus.FORBIDDEN.value, message="Denna användare är privat")

    def post(self, user: str, year: int):
        uid = User.get_user_id(db(), user)
        args = goals_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        Goal.upsert_user_goal(
            db(),
            uid,
            year,
            {
                "events": args['sum-events'],
            },
            {
                "distance": args['weekly-dist'],
            },
            args["route"],
        )
        return {}


class ListUserEvents(Resource):
    def get(self, user: str):
        uid = User.get_user_id(db(), user)
        if may_view(uid, view_parser.parse_args()['edit-key']):
            return Event.get_all_summaries(db(), uid)
        abort(HTTPStatus.FORBIDDEN.value, message="Denna användare är privat")

    def put(self, user: str):
        uid = User.get_user_id(db(), user)
        args = list_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            Event.add_summary(
                db(),
                uid,
                args['date'],
                get_summary(args),
            )
        except DatabaseError:
            abort(HTTPStatus.FORBIDDEN.value, message="Hoppsan, ett okänt fel inträffade")
        except IllegalEventType as err:
            abort(HTTPStatus.BAD_REQUEST.value, message=str(err))
        return {}


class UserEvent(Resource):
    def post(self, user: str, event_id: str):
        uid = User.get_user_id(db(), user)
        args = list_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            Event.edit_event(
                db(),
                event_id,
                uid,
                args['date'],
                get_summary(args),
            )
        except DatabaseError:
            abort(HTTPStatus.NOT_FOUND.value, message="Hittade inget pass att uppdatera")
        except IllegalEventType as err:
            abort(HTTPStatus.BAD_REQUEST.value, message=str(err))
        return {}

    def delete(self, user: str, event_id: str):
        uid = User.get_user_id(db(), user)
        args = view_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            Event.delete_event(
                db(),
                event_id,
                uid,
            )
        except DatabaseError:
            abort(HTTPStatus.NOT_FOUND.value, message="Hittade inget pass att ta bort")
        return {}


route_parser = reqparse.RequestParser()
route_parser.add_argument("edit-key", type=str, default=None)
route_parser.add_argument("name", type=str, help="Name of the route you created")
route_parser.add_argument("waypoints", type=str, action="append", help="Pairs of from and to as searched for")


def user_waypoints_parser(waypoints):
    def parse_waypoint(wpt):
        wpt_pair = [pt.strip() for pt in wpt.split('|')]
        wpt_pair = [pt for pt in wpt_pair if pt]
        if len(wpt_pair) != 2:
            raise ValueError(f"'{wpt}' definierar inte en del av en rutt")
        return tuple(wpt_pair)

    if not waypoints:
        raise ValueError("Tom rutt")
    return [
       parse_waypoint(waypoint) for waypoint in waypoints
    ]


class ListUserRoutes(Resource):
    def get(self, user: str):
        uid = User.get_user_id(db(), user)
        args = view_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        return Route.get_user_routes(db(), uid)

    def put(self, user: str):
        uid = User.get_user_id(db(), user)
        args = route_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            waypoints = user_waypoints_parser(args['waypoints'])
        except ValueError as err:
            abort(HTTPStatus.BAD_REQUEST.value, message=str(err))
        public = True
        try:
            route_id = Route.put_user_route(db(), uid, args["name"], waypoints, public)
        except DatabaseError:
            abort(HTTPStatus.INTERNAL_SERVER_ERROR.value, message="Oväntat fel vid insättning")
        else:
            return {"route_id": route_id}


class UserVisibleRoute(Resource):
    def get(self, user: str, route_id: str):
        uid = User.get_user_id(db(), user)
        args = view_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        route = Route.get_user_route(db(), uid, route_id)
        if not route:
            abort(HTTPStatus.NOT_FOUND.value, message="Rutten finns inte")
        return route

    def post(self, user: str, route_id: str):
        uid = User.get_user_id(db(), user)
        args = route_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            waypoints = user_waypoints_parser(args['waypoints'])
        except ValueError as err:
            abort(HTTPStatus.BAD_REQUEST.value, message=str(err))
        public = True
        try:
            Route.edit_user_route(db(), uid, route_id, args["name"], waypoints, public)
        except DatabaseError:
            abort(HTTPStatus.INTERNAL_SERVER_ERROR.value, message="Oväntat fel vid insättning")
        return {}
