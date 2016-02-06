import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
import datetime
import logging

app = Flask(__name__)

logging.basicConfig(filename='/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log',level=logging.DEBUG)

if 'OPENSHIFT_POSTGRESQL_DB_URL' in os.environ:
	db_url = os.environ['OPENSHIFT_POSTGRESQL_DB_URL']
else:
	db_url = 'postgresql://username:password@localhost:5432/back.db'

app.config['SQLALCHEMY_DATABASE_URI'] = db_url

Models = SQLAlchemy(app)

class User(Models.Model):
	id = Models.Column(Models.Integer, primary_key=True)
	username = Models.Column(Models.String(80), unique=True)
	email = Models.Column(Models.String(120), unique=True)

	def __init__(self, username, email):
		self.name = name
		self.email = email

	def __repr__(self):
		return "<User(name='%r', email='%r')>" % (self.name. self.email)

class Maps(Models.Model):
	id = Models.Column(Models.Integer, primary_key=True)
	name = Models.Column(Models.String(80), unique=True)
	players = Models.Column(Models.Integer)
	category = Models.Column(Models.String(20))
	background = Models.Column(JSON)
	dimensions = Models.Column(JSON)
	plain = Models.Column(JSON)
	terrain = Models.Column(JSON)
	buildings = Models.Column(JSON)
	unit = Models.Column(JSON)
	creator = Models.Column(Models.String(254))
	date = Models.Column(Models.DateTime, default=datetime.datetime.utcnow())

	def __init__(self, name, category, players, background, dimensions, plain, terrain, buildings, unit, creator):
		self.name = name
		self.category = category
		self.players = playersw
		self.background = background
		self.dimensions = dimensions
		self.plain = plain
		self.terrain = terrain
		self.buildings = buildings
		self.unit = unit
		self.creator = creator

	def __repr__(self):
		return "<Maps(name='%s')>" % (self.name)

class Games(Models.Model):
	id = Models.Column(Models.Integer, primary_key=True)
	name = Models.Column(Models.String(120), unique=True)
	map = Models.Column(JSON)
	players = Models.Column(JSON)

	def __init__(self, name, map, players):
		self.name = name
		self.map = map
		self.players = players

	def __repr__(self):
		return "<Games(name='%r', map='%r', players='%r')>" % (self.name, self.map, self.players)