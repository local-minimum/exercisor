from http import HTTPStatus

from flask_restful import Resource, abort, reqparse
from bson.objectid import ObjectId

from ..database import db
from ..exceptions import DatabaseError, IllegalEventType
from ..transactions import Event
from .user import may_view, may_edit

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
    @may_view
    def get(self, uid: ObjectId):
        return Event.get_all_summaries(db(), uid)

    @may_edit
    def put(self, uid: ObjectId):
        args = list_parser.parse_args()
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

    @may_edit
    def post(self, uid: ObjectId, event_id: str):
        args = list_parser.parse_args()
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

    @may_edit
    def delete(self, uid: ObjectId, event_id: str):
        try:
            Event.delete_event(
                db(),
                event_id,
                uid,
            )
        except DatabaseError:
            abort(HTTPStatus.NOT_FOUND.value, message="Hittade inget pass att ta bort")
        return {}
