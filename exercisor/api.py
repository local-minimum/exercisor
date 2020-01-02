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

view_parser = reqparse.RequestParser()
view_parser.add_argument("edit-key", type=str, default=None)

def get_summary(args):
    return {
        "calories": args['calories'],
        "duration": args['duration'],
        "distance": args['distance'],
    }


user_parser = reqparse.RequestParser()
user_parser.add_argument("user", type=str)
user_parser.add_argument("edit-key", type=str, default=None)
user_parser.add_argument("public", type=int, default=0)


def pwd_hash(pwd: Optional[str]) -> Optional[str]:
    if pwd is None:
        return None
    m = sha512()
    m.update(pwd.encode())
    return m.hexdigest()


class ListUser(Resource):
    def put(self):
        args = user_parser.parse_args()
        try:
            transactions.add_user(
                db(),
                args["user"],
                pwd_hash(args["edit-key"]),
                bool(args["public"]),
            )
        except DatabaseError:
            abort(HTTPStatus.FORBIDDEN.value, message="Username already taken")


def may_view(user, edit_key):
    settings = transactions.get_user_settings(db(), user)
    if settings['public']:
        return True
    return pwd_hash(edit_key) == settings['edit-key-hash']


def may_edit(user, edit_key):
    settings = transactions.get_user_settings(db(), user)
    return pwd_hash(edit_key) == settings['edit-key-hash']


class ListUserEvents(Resource):
    def get(self, user: str):
        if may_view(user, view_parser.parse_args()['edit-key']):
            return transactions.get_all_summaries(db(), user)
        abort(HTTPStatus.FORBIDDEN.value, message="You need edit key to view")

    def put(self, user: str):
        args = list_parser.parse_args()
        if not may_edit(user, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Need edit-key")
        try:
            transactions.add_summary(
                db(),
                user,
                args['date'],
                get_summary(args),
            )
        except DatabaseError:
            abort(HTTPStatus.FORBIDDEN.value)


class UserEvent(Resource):
    def post(self, user: str, doc_id: str):
        args = list_parser.parse_args()
        if not may_edit(user, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Need edit-key")
        try:
            transactions.edit_event(
                db(),
                doc_id,
                user,
                args['date'],
                get_summary(args),
            )
        except DatabaseError:
            abort(HTTPStatus.NOT_FOUND.value, message="No such event")

    def delete(self, user: str, doc_id: str):
        args = view_parser.parse_args()
        if not may_edit(user, args['edit-key']):
            abort(HTTPStatus.FORBIDDEN.value, message="Need edit-key")
        try:
            transactions.delete_event(
                db(),
                doc_id,
                user,
            )
        except DatabaseError:
            abort(HTTPStatus.NOT_FOUND.value, message="No such event")