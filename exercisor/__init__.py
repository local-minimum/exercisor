import os

from flask import Flask
from flask_restful import Api

from .api import event, goal, route, user
from .transactions.User import user_loader_setup
from .database import db

BASEURL = os.environ.get("EXERCISOR_BASEURL", "/exercisor/api")
app = Flask(__name__)
app.secret_key = os.environ.get('EXERCISOR_SECRET', 'testenvironment')

api = Api(app)
login_manager = user.login_manager(app)
user_loader_setup(login_manager, db())

# ~/route/*
api.add_resource(route.ListRoutes, f"{BASEURL}/route")

# ~/my/*
api.add_resource(user.MySettings, f"{BASEURL}/my/settings")
api.add_resource(user.MyFollowingList, f"{BASEURL}/my/following")
api.add_resource(user.MyFollowing, f"{BASEURL}/my/following/<string:following_id>")

# ~/user/*
USERURL = f"{BASEURL}/user/<string:user>"
api.add_resource(user.ListUser, f"{BASEURL}/user")
api.add_resource(goal.UserYearGoals, f"{USERURL}/goal/<int:year>")
api.add_resource(goal.UserTotalGoals, f"{USERURL}/goal/total")
api.add_resource(event.ListUserEvents, f"{USERURL}/event")
api.add_resource(event.UserEvent, f"{USERURL}/event/<string:event_id>")
api.add_resource(route.ListUserRoutes, f"{USERURL}/route")
api.add_resource(route.UserVisibleRoute, f"{USERURL}/route/<string:route_id>")
