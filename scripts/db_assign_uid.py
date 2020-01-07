import os
from pymongo import MongoClient

def db():
    client = MongoClient(
        os.environ.get("EXERCISOR_MONGO_HOST", "localhost"),
        int(os.environ.get("EXERCISOR_MONGO_PORT", "27017")),
    )
    return client[os.environ.get("EXERCISOR_MONGO_DB", "exercisor")]

database = db()

EVENTS_COLLECTION = 'events'
USER_SETTINGS = 'users'
USER_GOALS = 'goals'

users = {doc['user']: doc['_id'] for doc in database[USER_SETTINGS].find()}

print("update goals")
for goal in database[USER_GOALS].find({}):
    database[USER_GOALS].update_one({"_id": goal["_id"]}, {"$set": {"uid": users[goal["user"]]}})

print("update events")
for event in database[EVENTS_COLLECTION].find({}):
    database[EVENTS_COLLECTION].update_one({"_id": event["_id"]}, {"$set": {"uid": users[event["user"]]}})

