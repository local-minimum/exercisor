from enum import Enum
import datetime as dt
from http import HTTPStatus
from typing import Optional, Callable

from flask import Flask
from flask_restful import abort, reqparse, Resource
from flask_login import LoginManager, login_user, current_user, logout_user

from ..exceptions import DatabaseError, BadAppInitialization
from ..database import db
from ..transactions import User


class AccessRole(Enum):
    PUBLIC = 0
    LOGGED_IN_READ = 1
    USER = 2
    SESSION = 3


class Authorization:
    def __init__(self, role: AccessRole):
        self._role = role

    def __call__(self, endpoint: Callable):
        if self._role is AccessRole.PUBLIC:
            return endpoint
        elif self._role is AccessRole.LOGGED_IN_READ:
            return Authorization.has_logged_in_read(endpoint)
        elif self._role is AccessRole.USER:
            return Authorization.has_user_write_access(endpoint)
        elif self._role is AccessRole.SESSION:
            return Authorization.has_valid_session(endpoint)
        else:
            abort(HTTPStatus.FORBIDDEN.value, message="Åtkomst nekad")

    @staticmethod
    def has_valid_session(endpoint: Callable):
        def authorize(other, *args, **kwargs):
            if not current_user.is_authenticated:
                return abort(HTTPStatus.FORBIDDEN.value, message="Du måste vara inloggad")
            if User.get_user_status_from_session(db(), current_user.get_id()):
                return endpoint(other, current_user, *args, **kwargs)
            return abort(HTTPStatus.FORBIDDEN.value, message="Du behöver logga in igen")

        return authorize

    @staticmethod
    def has_logged_in_read(endpoint: Callable):
        def authorize(other, user: str, *args, **kwargs):
            uid = User.get_user_id(db(), user)
            if uid is None:
                return abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")
            try:
                public = User.get_public_user(db(), uid)
            except DatabaseError:
                return abort(HTTPStatus.NOT_FOUND.value, message="Det finns ingen med det namnet")

            if public or uid == current_user.uid:
                return endpoint(other, uid, *args, **kwargs)

            return abort(HTTPStatus.FORBIDDEN.value, message="Du måste vara inloggad")

        return authorize

    @staticmethod
    def has_user_write_access(endpoint: Callable):
        def authorize(other, user: str, *args, **kwargs):
            if not current_user.is_authenticated:
                return abort(HTTPStatus.FORBIDDEN.value, message="Du måste vara inloggad")

            uid = User.get_user_id(db(), user)
            if uid is None or current_user.uid != current_user.uid:
                return abort(HTTPStatus.FORBIDDEN.value, message="Inte tillräckliga rättigheter")

            return endpoint(other, uid, *args, **kwargs)

        return authorize


user_parser = reqparse.RequestParser()
user_parser.add_argument("user", type=str)
user_parser.add_argument("password", type=str, default=None)
user_parser.add_argument("public", type=int, default=1)


def call_once(decorated: Callable):
    _cache = []

    def setup(*args, **kwargs):
        if _cache:
            return _cache[0]
        else:
            response = decorated(*args, **kwargs)
            _cache.append(response)
        return response
    return setup


@call_once
def login_manager(app: Optional[Flask] = None):
    if app is None:
        raise BadAppInitialization("Forgot to init login manager!")
    manager = LoginManager()
    manager.init_app(app)
    return manager


class ListUser(Resource):
    @Authorization(AccessRole.PUBLIC)
    def put(self):
        args = user_parser.parse_args()
        if not args["user"]:
            return abort(HTTPStatus.BAD_REQUEST.value, message="Användarnamn är ett måster")
        if not args["password"]:
            return abort(HTTPStatus.BAD_REQUEST.value, message="Lösenord är ett måste")
        if len(args["password"]) < 8:
            return abort(HTTPStatus.BAD_REQUEST.value, message="Lösenord för kort")
        if args["password"] in args["user"] or args["user"] in args["password"]:
            return abort(HTTPStatus.BAD_REQUEST.value, message="Lösenord och användarnamn för lika")
        try:
            User.add_user(
                db(),
                args["user"],
                args["password"],
                bool(args["public"]),
            )
        except DatabaseError:
            abort(HTTPStatus.FORBIDDEN.value, message="Användarnamn redan taget")
        return {}

    @Authorization(AccessRole.PUBLIC)
    def post(self):
        args = user_parser.parse_args()
        user = User.start_user_session(db(), args['user'], args['password'])
        if user is None:
            return abort(HTTPStatus.UNAUTHORIZED.value, message="Felaktigt användarnamn eller lösenord")
        login_user(user, duration=dt.timedelta(days=7))
        return {}

    @Authorization(AccessRole.PUBLIC)
    def delete(self):
        if current_user.is_authenticated:
            if User.end_user_session(db(), current_user):
                logout_user()
                return {}
        return abort(
            HTTPStatus.INTERNAL_SERVER_ERROR.value, message="Kunde inte logga ut, kanske är du redan utloggad?",
        )


class MySettings(Resource):
    @Authorization(AccessRole.SESSION)
    def get(self, user: User.UserStatus):
        return {
            "name": user.name,
        }


follow_parser = reqparse.RequestParser()
follow_parser.add_argument("user", type=str)


class MyFollowingList(Resource):
    @Authorization(AccessRole.SESSION)
    def get(self, user: User.UserStatus):
        return User.get_user_following(db(), user.uid)

    @Authorization(AccessRole.SESSION)
    def put(self, user: User.UserStatus):
        args = follow_parser.parse_args()
        if User.put_user_follow(db(), user.uid, args["user"]):
            return {}
        return abort(
            HTTPStatus.BAD_REQUEST.value,
            message=f"Kunde inte följa '{args['user']}'",
        )


class MyFollowing(Resource):
    @Authorization(AccessRole.SESSION)
    def delete(self, user: User.UserStatus, following_id):
        if User.delete_user_follow(db(), user.uid, following_id):
            return {}
        return abort(
            HTTPStatus.BAD_REQUEST.value,
            message=f"Hittade ingen att avfölja",
        )
