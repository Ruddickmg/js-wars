import os, datetime, logging, json
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import BigInteger, Integer, String, DateTime, Column, create_engine
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

app = Flask(__name__)

logging.basicConfig(filename='/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log',level=logging.DEBUG)

if 'OPENSHIFT_POSTGRESQL_DB_URL' in os.environ:
	db_url = os.environ['OPENSHIFT_POSTGRESQL_DB_URL']
else:
	db_url = 'postgresql://username:password@localhost:5432/back.db'

app.config['SQLALCHEMY_DATABASE_URI'] = db_url

engine = create_engine(db_url, convert_unicode=True)
Session = sessionmaker(bind=engine)
db_session = scoped_session(Session)
Base = declarative_base()
Base.query = db_session.query_property()

class User(Base):

	__tablename__ = 'user'
	id = Column(BigInteger, primary_key=True)
	facebook = Column(BigInteger, unique=True)
	google = Column(BigInteger, unique=True)
	twitter = Column(BigInteger, unique=True)
	email = Column(String(120), unique=True)
	lastName = Column(String(80))
	firstName = Column(String(80))
	name = Column(String(80))
	saved = Column(JSON)
	password = Column(String(120))

	def __init__(self, email, lastName, firstName, name):
		self.facebook = None
		self.google = None
		self.twitter = None
		self.email = email
		self.lastName = lastName
		self.firstName = firstName
		self.name = name
		self.saved = json.dumps([])
		self.password = None

	def __repr__(self):
		return "<User(name='%r', email='%r', saved='%r')>" % (self.name, self.email, self.saved)

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
	gameId = Column(Integer)
	name = Column(String(120), unique=True)
	map = Column(JSON)
	settings = Column(JSON)
	players = Column(JSON)

	def __init__(self, id, name, map, settings, players):
		self.gameId = id
		self.name = name
		self.map = map
		self.settings = settings
		self.players = players

	def __repr__(self):
		return "<Games(name='%r', map='%r', settings='%r', players='%r')>" % (self.name, self.map, self.settings, self.players)

# roll back database to precvious state
def Rollback():
	try:
		session = Session()
		session.rollback()
		session.close()

	except Exception as e:
		Teardown(e, session)

	finally:
		session.close

# add defined orm tables to database
def Migrate():
	try:
		session = Session()
		Base.metadata.create_all(engine)
		session.close()
		return True

	except Exception as e:
		return False;
		Teardown(e, session)

	finally:
		session.close()

# remove all database tables
def DropAll():
	try:
		session = Session()
		logging.debug('dropping...')
		Base.metadata.reflect(engine)
		logging.debug('reflect...')
		Base.metadata.drop_all(engine)
		logging.debug('done..')

	except Exception as e:
		Teardown(e, False)
		return 'not dropped'

	finally:
		session.close()

def Teardown(exception, session):

	if exception:
		logging.debug(exception)
		if session:	
			session.rollback()
			session.close()

	if session:	
		session.close()