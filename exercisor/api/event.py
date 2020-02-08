from http import HTTPStatus

from flask_restful import Resource, abort, reqparse

from ..database import db
from ..exceptions import DatabaseError, IllegalEventType
from ..transactions import User, Event
from .user import may_view, may_edit, view_parser

ACCEPTED_EVENT_TYPES = ["CrossTrainer", "Running", "Walking", "Hiking", "Golfing", "Biking"]

list_parser = reqparse.RequestParser()
list_parser.add_argument("edit-key", type=str, default=None)
list_parser.add_argument("date", type=str, help="Event date")
list_parser.add_argument("calories", type=int, default=None)
list_parser.add_argument("duration", type=float, default=None, help="In minutes")
list_parser.add_argument("distance", type=float, default=None)
list_parser.add_argument("type", type=str, default="CrossTrainer")


def get_summary(args):
    if args['type'] not in ACCEPTED_EVENT_TYPES:
        raise IllegalEventType(f"{args['type']} inte tillåtet som motionstyp.")

    return {
        "calories": args['calories'],
        "duration": args['duration'],
        "distance": args['distance'],
        "type": args['type'],
    }


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
