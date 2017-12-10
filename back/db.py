import json
import logging
import os
from datetime import datetime
from sqlalchemy import BigInteger, Integer, String, DateTime, Column, Table, ForeignKey, create_engine
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker, relationship

user = os.environ.get('DB_USER', 'user')
password = os.environ.get('DB_PASSWORD', 'password')
address = os.environ.get('DB_ADDR', '0.0.0.0')
port = os.environ.get('DB_PORT', '')
db_name = os.environ.get('DB_NAME', '')
test_db_name = "test"
db_url = "postgresql://%s:%s@%s:%s" % (user, password, address, port)
app_db_uri = "%s/%s" % (db_url, db_name)
test_db_uri = "%s/%s" % (db_url, test_db_name)

databases = {}
Base = declarative_base()

for uri, name in [(app_db_uri, db_name), (test_db_uri, test_db_name)]:
    print("name: %s, uri: %s" % (name, uri))
    db_engine = create_engine(uri, convert_unicode=True, client_encoding='utf8')
    db_session = scoped_session(sessionmaker(bind=db_engine))

    databases[name] = (db_session, db_engine)

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
        db_name = Column(String(80))
        saved = Column(JSON)
        password = Column(String(120))

        def __init__(self, email, last_name, first_name, user_name):
            self.email = email
            self.lastName = last_name
            self.firstName = first_name
            self.name = user_name
            self.saved = json.dumps([])

        def __repr__(self):
            return "<User(name='%r', email='%r')>" % (self.name, self.email)

    class Maps(Base):
        __tablename__ = "maps"
        id = Column(Integer, primary_key=True)
        creator_id = Column(Integer, ForeignKey('user.id'))
        creator = relationship("User", back_populates="savedMaps")
        db_name = Column(String(80), unique=True)
        maximumAmountOfPlayers = Column(Integer)
        category = Column(String(20))
        dimensions = Column(JSON)
        terrain = Column(JSON)
        buildings = Column(JSON)
        units = Column(JSON)
        date = Column(DateTime, default=datetime.utcnow())

        def __init__(self, map_name, category, maximum_amount_of_players, dimensions, terrain, buildings, units):
            self.name = map_name
            self.category = category
            self.maximumAmountOfPlayers = maximum_amount_of_players
            self.dimensions = dimensions
            self.terrain = terrain
            self.buildings = buildings
            self.units = units

        def __repr__(self):
            return "<Maps(name='%s')>" % self.name


    class Games(Base):
        __tablename__ = "games"
        id = Column(Integer, primary_key=True)
        users = relationship("User", secondary=saved_games, back_populates="savedGames")
        db_name = Column(String(120), unique=True)
        category = Column(String(120))
        map = Column(JSON)
        settings = Column(JSON)
        players = Column(JSON)
        date = Column(DateTime, onupdate=datetime.utcnow())

        def __init__(self, game_name, category, game_map, settings, players):
            self.name = game_name
            self.category = category
            self.map = game_map
            self.settings = settings
            self.players = players
            self.saved = True

        def __repr__(self):
            return "<Games(name='%r', map='%r', settings='%r', players='%r')>" % (
                self.name, self.map, self.settings, self.players)


def rollback(database_name=db_name):
    session, engine = databases[database_name]
    try:
        session = session()
        session.rollback()
    except Exception as e:
        handle_exception(e, session)
    finally:
        session.close()


def migrate(database_name=db_name):
    print("name: %s" % db_name)
    session, engine = databases[database_name]
    try:
        session = session()
        Base.metadata.create_all(engine)
        return True
    except Exception as error:
        print(error)
        handle_exception(error, session)
        return False
    finally:
        session.close()


def drop_all_tables(database_name=db_name):
    session, engine = databases[database_name]
    meta = Base.metadata
    try:
        session = session()
        session.close_all()
        meta.reflect(engine)
        meta.drop_all(engine)
        return True
    except Exception as error:
        handle_exception(error, False)
        return False
    finally:
        session.close()


def handle_exception(exception, session):
    if exception:
        logging.debug(exception)
        print(exception)
        if session:
            session.rollback()
            session.close()
    if session:
        session.close()


def get_session(database_name):
    session, _ = databases[database_name]
    return session()


def get_url():
    return db_url
