import os

from flask import Flask
from flask_restful import Api

from .api import ListUserEvents, UserEvent, ListUser

baseurl = os.environ.get("EXERCISOR_BASEURL", "/exercisor/api")
app = Flask(__name__)

api = Api(app)
api.add_resource(ListUserEvents, "{}/<string:user>".format(baseurl))
api.add_resource(UserEvent, "{}/<string:user>/<string:doc_id>".format(baseurl))
api.add_resource(ListUser, "{}".format(baseurl))
