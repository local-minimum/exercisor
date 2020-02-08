from typing import Tuple, cast
from http import HTTPStatus

from flask_restful import Resource, abort, reqparse
from bson.objectid import ObjectId

from ..database import db
from ..exceptions import DatabaseError
from ..transactions import Route
from .user import may_edit, may_view

route_parser = reqparse.RequestParser()
route_parser.add_argument("edit-key", type=str, default=None)
route_parser.add_argument("name", type=str, help="Name of the route you created")
route_parser.add_argument("waypoints", type=str, action="append", help="Pairs of from and to as searched for")


def user_waypoints_parser(waypoints):
    def parse_waypoint(wpt: str) -> Tuple[str, str]:
        wpt_pair = [pt.strip() for pt in wpt.split('|')]
        wpt_pair = [pt for pt in wpt_pair if pt]
        if len(wpt_pair) != 2:
            raise ValueError(f"'{wpt}' definierar inte en del av en rutt")
        return cast(Tuple[str, str], tuple(wpt_pair))

    if not waypoints:
        raise ValueError("Tom rutt")
    return [
        parse_waypoint(waypoint) for waypoint in waypoints
    ]


class ListRoutes(Resource):
    def get(self):
        return Route.get_public_routes(db())


class UserVisibleRoute(Resource):
    @may_view
    def get(self, uid: ObjectId, route_id: str):
        route = Route.get_user_route(db(), uid, route_id)
        if not route:
            abort(HTTPStatus.NOT_FOUND.value, message="Rutten finns inte")
        return route

    @may_edit
    def post(self, uid: ObjectId, route_id: str):
        args = route_parser.parse_args()
        try:
            waypoints = user_waypoints_parser(args['waypoints'])
        except ValueError as err:
            return abort(HTTPStatus.BAD_REQUEST.value, message=str(err))
        public = True
        try:
            Route.edit_user_route(db(), uid, route_id, args["name"], waypoints, public)
        except DatabaseError:
            abort(HTTPStatus.INTERNAL_SERVER_ERROR.value, message="Oväntat fel vid insättning")
        return {}


class ListUserRoutes(Resource):
    @may_view
    def get(self, uid: ObjectId):
        return Route.get_user_routes(db(), uid)

    @may_edit
    def put(self, uid: ObjectId):
        args = route_parser.parse_args()
        try:
            waypoints = user_waypoints_parser(args['waypoints'])
        except ValueError as err:
            return abort(HTTPStatus.BAD_REQUEST.value, message=str(err))
        public = True
        try:
            route_id = Route.put_user_route(db(), uid, args["name"], waypoints, public)
        except DatabaseError:
            return abort(HTTPStatus.INTERNAL_SERVER_ERROR.value, message="Oväntat fel vid insättning")
        else:
            return {"route_id": route_id}
