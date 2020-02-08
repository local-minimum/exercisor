from http import HTTPStatus
from hashlib import sha512
from typing import Optional, Callable

from flask_restful import abort, reqparse, Resource

from ..exceptions import DatabaseError
from ..database import db
from ..transactions import User

view_parser = reqparse.RequestParser()
view_parser.add_argument("edit-key", type=str, default=None)


def pwd_hash(pwd: Optional[str]) -> Optional[str]:
    if pwd is None:
        return None
    m = sha512()
    m.update(pwd.encode())
    return m.hexdigest()


def may_view(endpoint: Callable):
    def authorize(self, user: str, *args, **kwargs):
        uid = User.get_user_id(db(), user)
        req_args = view_parser.parse_args()
        try:
            settings = User.get_user_settings(db(), uid)
        except DatabaseError:
            return abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
        if settings['public']:
            return endpoint(self, uid, *args, **kwargs)
        if pwd_hash(req_args['edit-key']) == settings['edit-key-hash']:
            return endpoint(self, uid, *args, **kwargs)
        abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
    return authorize


def may_edit(endpoint: Callable):
    def authorize(self, user: str, *args, **kwargs):
        uid = User.get_user_id(db(), user)
        req_args = view_parser.parse_args()
        try:
            settings = User.get_user_settings(db(), uid)
        except DatabaseError:
            return abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
        if pwd_hash(req_args['edit-key']) == settings['edit-key-hash']:
            return endpoint(self, uid, *args, **kwargs)
        abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
    return authorize


user_parser = reqparse.RequestParser()
user_parser.add_argument("user", type=str)
user_parser.add_argument("edit-key", type=str, default=None)
user_parser.add_argument("public", type=int, default=1)


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
