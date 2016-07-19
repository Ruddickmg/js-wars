import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, DateTime, Column, create_engine
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import datetime
import logging

app = Flask(__name__)

logging.basicConfig(filename='/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log',level=logging.DEBUG)

if 'OPENSHIFT_POSTGRESQL_DB_URL' in os.environ:
	db_url = os.environ['OPENSHIFT_POSTGRESQL_DB_URL']
else:
	db_url = 'postgresql://username:password@localhost:5432/back.db'

app.config['SQLALCHEMY_DATABASE_URI'] = db_url

engine = create_engine(db_url, convert_unicode=True)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
	__tablename__ = 'user'
	id = Column(Integer, primary_key=True)
	username = Column(String(80), unique=True)
	email = Column(String(120), unique=True)

	def __init__(self, username, email):
		self.name = name
		self.email = email

	def __repr__(self):
		return "<User(name='%r', email='%r')>" % (self.name. self.email)

class Maps(Base):

	__tablename__ = 'maps'
	id = Column(Integer, primary_key=True)
	name = Column(String(80), unique=True)
	players = Column(Integer)
	category = Column(String(20))
	dimensions = Column(JSON)
	terrain = Column(JSON)
	buildings = Column(JSON)
	units = Column(JSON)
	creator = Column(String(254))
	date = Column(DateTime, default=datetime.datetime.utcnow())

	def __init__(self, name, category, players, dimensions, terrain, buildings, units, creator):
		self.name = name
		self.category = category
		self.players = players
		self.dimensions = dimensions
		self.terrain = terrain
		self.buildings = buildings
		self.units = units
		self.creator = creator

	def __repr__(self):
		return "<Maps(name='%s')>" % (self.name)

class Games(Base):
	__tablename__ = 'games'
	id = Column(Integer, primary_key=True)
	name = Column(String(120), unique=True)
	map = Column(JSON)
	players = Column(JSON)

	def __init__(self, name, map, players):
		self.name = name
		self.map = map
		self.players = players

	def __repr__(self):
		return "<Games(name='%r', map='%r', players='%r')>" % (self.name, self.map, self.players)

def Rollback():
	try:
		session = Session()
		session.rollback()
		session.close()

	except Exception as e:
		Teardown(e, session)

	finally:
		session.close

def Migrate():
	try:
		session = Session()
		Base.metadata.create_all(engine)
		session.close()

	except Exception as e:
		Teardown(e, session)

	finally:
		session.close()

def DropAll():
	try:
		session = Session()
		Base.metadata.reflect(engine)
		Base.metadata.drop_all(engine)

	except Exception as e:
		Teardown(e, False)
		return 'not dropped'

	finally:
		session.close()

def GetSession ():
	return Session()

def Teardown(exception, session):

	if exception:
		logging.debug(exception)
		if session:	
			session.rollback()
			session.close()

	if session:	
		session.close()