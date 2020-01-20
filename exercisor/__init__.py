import os

from flask import Flask
from flask_restful import Api

from .api import (
    ListUserEvents, UserEvent, ListUser, UserYearGoals,
    ListRoutes,
)

BASEURL = os.environ.get("EXERCISOR_BASEURL", "/exercisor/api")
app = Flask(__name__)

api = Api(app)

api.add_resource(ListRoutes, f"{BASEURL}/route")

USERURL = f"{BASEURL}/user/<string:user>"
api.add_resource(ListUser, f"{BASEURL}/user")
api.add_resource(UserYearGoals, f"{USERURL}/goal/<int:year>")
api.add_resource(ListUserEvents, f"{USERURL}/event")
api.add_resource(UserEvent, f"{USERURL}/event/<string:doc_id>")
