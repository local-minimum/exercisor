from enum import Enum
from http import HTTPStatus
from hashlib import sha512
from typing import Optional, Callable

from flask_restful import abort, reqparse, Resource

from ..exceptions import DatabaseError
from ..database import db
from ..transactions import User

view_parser = reqparse.RequestParser()
view_parser.add_argument("edit-key", type=str, default=None)


class AccessRole(Enum):
    PUBLIC = 0
    LOGGED_IN = 1
    USER = 2


def pwd_hash(pwd: Optional[str]) -> Optional[str]:
    if pwd is None:
        return None
    m = sha512()
    m.update(pwd.encode())
    return m.hexdigest()


class Authorization:
    def __init__(self, role: AccessRole):
        self._role = role

    def __call__(self, endpoint: Callable):
        if self._role is AccessRole.PUBLIC:
            return endpoint
        elif self._role is AccessRole.LOGGED_IN:
            return self.may_view(endpoint)
        elif self._role is AccessRole.USER:
            return self.may_edit(endpoint)
        else:
            abort(HTTPStatus.FORBIDDEN.value, message="Åtkomst nekad")

    def may_view(self, endpoint: Callable):
        def authorize(other, user: str, *args, **kwargs):
            uid = User.get_user_id(db(), user)
            req_args = view_parser.parse_args()
            try:
                settings = User.get_user_settings(db(), uid)
            except DatabaseError:
                return abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
            if settings['public']:
                return endpoint(other, uid, *args, **kwargs)
            if pwd_hash(req_args['edit-key']) == settings['edit-key-hash']:
                return endpoint(other, uid, *args, **kwargs)
            abort(HTTPStatus.FORBIDDEN.value, message="Felaktigt lösenord")
        return authorize

    def may_edit(self, endpoint: Callable):
        def authorize(other, user: str, *args, **kwargs):
            uid = User.get_user_id(db(), user)
            req_args = view_parser.parse_args()
            try:
                settings = User.get_user_settings(db(), uid)
            except DatabaseError:
                return abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
            if pwd_hash(req_args['edit-key']) == settings['edit-key-hash']:
                return endpoint(other, uid, *args, **kwargs)
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
