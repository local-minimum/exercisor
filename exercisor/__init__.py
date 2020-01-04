import os

from flask import Flask
from flask_restful import Api

from .api import ListUserEvents, UserEvent, ListUser, UserYearGoals

BASEURL = os.environ.get("EXERCISOR_BASEURL", "/exercisor/api")
USERURL = "{}/<string:user>".format(BASEURL)
app = Flask(__name__)

api = Api(app)
api.add_resource(ListUser, "{}".format(BASEURL))

api.add_resource(UserYearGoals, "{}/goal/<int:year>".format(USERURL))
api.add_resource(ListUserEvents, "{}/event".format(USERURL))
api.add_resource(UserEvent, "{}/event/<string:doc_id>".format(USERURL))
