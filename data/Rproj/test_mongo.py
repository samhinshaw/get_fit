# import pymongo
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27025/')
db = client.get_fit
sam = db.sam

sam.insert_one(day)
