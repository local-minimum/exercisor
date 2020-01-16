import os
from functools import lru_cache
from http import HTTPStatus
from hashlib import sha512
from typing import Optional

from flask_restful import Resource, abort, reqparse
from pymongo import MongoClient

from . import transactions
from .exceptions import DatabaseError


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


def get_summary(args):
    return {
        "calories": args['calories'],
        "duration": args['duration'],
        "distance": args['distance'],
        "type": args['type'],
    }


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
            transactions.add_user(
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
        settings = transactions.get_user_settings(db(), uid)
    except DatabaseError:
        abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
    else:
        if settings['public']:
            return True
        return pwd_hash(edit_key) == settings['edit-key-hash']
    return False


def may_edit(uid, edit_key):
    try:
        settings = transactions.get_user_settings(db(), uid)
    except DatabaseError:
        abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
    else:
        return pwd_hash(edit_key) == settings['edit-key-hash']
    return False


goals_parser = reqparse.RequestParser()
goals_parser.add_argument("edit-key", type=str, default=None)
goals_parser.add_argument("sum-events", type=int, help="Total number of events this year")


class UserYearGoals(Resource):
    def get(self, user: str, year: int):
        uid = transactions.get_user_id(db(), user)
        if may_view(uid, view_parser.parse_args()['edit-key']):
            return transactions.get_user_goal(db(), uid, year)
        abort(HTTPStatus.FORBIDDEN.value, message="Denna användare är privat")

    def post(self, user: str, year: int):
        uid = transactions.get_user_id(db(), user)
        args = goals_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        transactions.upsert_user_goal(
            db(),
            uid,
            year,
            {
                "events": args['sum-events'],
            }
        )
        return {}


class ListUserEvents(Resource):
    def get(self, user: str):
        uid = transactions.get_user_id(db(), user)
        if may_view(uid, view_parser.parse_args()['edit-key']):
            return transactions.get_all_summaries(db(), uid)
        abort(HTTPStatus.FORBIDDEN.value, message="Denna användare är privat")

    def put(self, user: str):
        uid = transactions.get_user_id(db(), user)
        args = list_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            transactions.add_summary(
                db(),
                uid,
                args['date'],
                get_summary(args),
            )
        except DatabaseError:
            abort(HTTPStatus.FORBIDDEN.value, message="Hoppsan, ett okänt fel inträffade")
        return {}


class UserEvent(Resource):
    def post(self, user: str, doc_id: str):
        uid = transactions.get_user_id(db(), user)
        args = list_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            transactions.edit_event(
                db(),
                doc_id,
                uid,
                args['date'],
                get_summary(args),
            )
        except DatabaseError:
            abort(HTTPStatus.NOT_FOUND.value, message="Hittade inget pass att uppdatera")
        return {}

    def delete(self, user: str, doc_id: str):
        uid = transactions.get_user_id(db(), user)
        args = view_parser.parse_args()
        if not may_edit(uid, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        try:
            transactions.delete_event(
                db(),
                doc_id,
                uid,
            )
        except DatabaseError:
            abort(HTTPStatus.NOT_FOUND.value, message="Hittade inget pass att ta bort")
        return {}
