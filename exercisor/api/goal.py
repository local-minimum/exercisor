from flask_restful import Resource, reqparse
from bson.objectid import ObjectId

from ..database import db
from ..transactions import Goal
from .user import Authorization, AccessRole


goals_parser = reqparse.RequestParser()
goals_parser.add_argument("edit-key", type=str, default=None)
goals_parser.add_argument("sum-events", type=int, default=None, help="Total number of events this year")
goals_parser.add_argument("weekly-dist", type=float, default=None, help="Genomsnittsavstånd per vecka")
goals_parser.add_argument("route", type=str, default=None, help="Rutt id för rutt på kartan")


class UserTotalGoals(Resource):
    @Authorization(AccessRole.LOGGED_IN_READ)
    def get(self, uid: ObjectId):
        return Goal.get_user_total_goal(db(), uid)

    @Authorization(AccessRole.USER)
    def post(self, uid: ObjectId):
        args = goals_parser.parse_args()
        Goal.upsert_user_total_goal(
            db(),
            uid,
            args["route"],
        )
        return {}


class UserYearGoals(Resource):
    @Authorization(AccessRole.LOGGED_IN_READ)
    def get(self, uid: ObjectId, year: int):
        return Goal.get_user_goal(db(), uid, year)

    @Authorization(AccessRole.USER)
    def post(self, uid: ObjectId, year: int):
        args = goals_parser.parse_args()
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
