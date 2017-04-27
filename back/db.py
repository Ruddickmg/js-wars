import os, logging, json
from datetime import datetime
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import BigInteger, Integer, String, DateTime, Column, Table, ForeignKey, create_engine
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import scoped_session, sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base

if "OPENSHIFT_POSTGRESQL_DB_URL" in os.environ:

	db_url = os.environ.get("OPENSHIFT_POSTGRESQL_DB_URL")
	logging.basicConfig(filename="/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log",level=logging.DEBUG)

else:

	user = os.environ.get('DB_USER','user')
	password = os.environ.get('DB_PASSWORD','password')
	address = os.environ.get('DB_ADDR','0.0.0.0')
	port = os.environ.get('DB_PORT','')
	name = os.environ.get('DB_NAME','')
	db_url = "postgresql://%s:%s@%s:%s/%s" % (user, password, address, port, name) 

engine = create_engine(db_url, convert_unicode=True, client_encoding='utf8')
Session = scoped_session(sessionmaker(bind=engine))
Base = declarative_base()
Base.query = Session.query_property()

saved_games = Table("saved_games", Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id")),
    Column("game_id", Integer, ForeignKey("games.id"))
)

class User(Base):

	__tablename__ = "user"
	id = Column(BigInteger, primary_key=True)
	facebook = Column(BigInteger, unique=True)
	google = Column(BigInteger, unique=True)
	twitter = Column(BigInteger, unique=True)
	email = Column(String(120), unique=True)
	savedGames = relationship(
        "Games",
        secondary=saved_games,
        back_populates="users")
	savedMaps = relationship("Maps", cascade="all,delete")
	lastName = Column(String(80))
	firstName = Column(String(80))
	name = Column(String(80))
	saved = Column(JSON)
	password = Column(String(120))

	def __init__(self, email, lastName, firstName, name):
		self.email = email
		self.lastName = lastName
		self.firstName = firstName
		self.name = name
		self.saved = json.dumps([])

	def __repr__(self):
		return "<User(name='%r', email='%r')>" % (self.name, self.email)

class Maps(Base):

	__tablename__ = "maps"
	id = Column(Integer, primary_key=True)
	creator_id = Column(Integer, ForeignKey('user.id'))
	creator = relationship("User", back_populates="savedMaps")
	name = Column(String(80), unique=True)
	players = Column(Integer)
	category = Column(String(20))
	dimensions = Column(JSON)
	terrain = Column(JSON)
	buildings = Column(JSON)
	units = Column(JSON)
	date = Column(DateTime, default=datetime.utcnow())

	def __init__(self, name, category, players, dimensions, terrain, buildings, units):
		self.name = name
		self.category = category
		self.players = players
		self.dimensions = dimensions
		self.terrain = terrain
		self.buildings = buildings
		self.units = units

	def __repr__(self):
		return "<Maps(name='%s')>" % (self.name)

class Games(Base):

	__tablename__ = "games"
	id = Column(Integer, primary_key=True)
	users = relationship(
        "User",
        secondary=saved_games,
        back_populates="savedGames")
	gameId = Column(Integer)
	name = Column(String(120), unique=True)
	map = Column(JSON)
	settings = Column(JSON)
	players = Column(JSON)
	date = Column(DateTime, onupdate=datetime.utcnow())

	def __init__(self, id, name, map, settings, players):
		self.gameId = id
		self.name = name
		self.map = map
		self.settings = settings
		self.players = players
		self.saved = True

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
		Base.metadata.reflect(engine)
		Base.metadata.drop_all(engine)

	except Exception as e:
		Teardown(e, False)
		return "not dropped"

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

def GetUrl ():

	return db_url	