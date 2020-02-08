from http import HTTPStatus

from flask_restful import Resource, abort, reqparse

from ..database import db
from ..transactions import User, Goal
from .user import may_view, may_edit, view_parser


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
