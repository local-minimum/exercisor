from http import HTTPStatus
from hashlib import sha512
from typing import Optional

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
