import json
from datetime import datetime, timedelta
from flask import Flask, request, Response
from db import Maps, User, Games, handle_exception, rollback, migrate, drop_all_tables, get_session

app = Flask(__name__)


def user_by_email(email, session):
    return session.query(User).filter_by(email=email).first()


def add_origin_id(user, origin, origin_id):
    if not getattr(user, origin) and ["facebook", "google", "twitter"].index(origin) >= 0:
        setattr(user, origin, origin_id)


def user_to_dict(user):
    if user:
        return {
            "id": user.id,
            "email": user.email,
            "last_name": user.lastName,
            "first_name": user.firstName,
            "name": user.name
        }


def games_to_dict(game):
    if game:
        return {
            "id": game.id,
            "name": game.name,
            "category": game.category,
            "map": game.map,
            "settings": game.settings,
            "players": [],
            "saved": game.players
        }


def maps_to_dict(maps):
    if maps:
        return {
            "name": maps.name,
            "id": maps.id,
            "category": maps.category,
            "maximumAmountOfPlayers": maps.maximumAmountOfPlayers,
            "buildings": maps.buildings,
            "dimensions": maps.dimensions,
            "terrain": maps.terrain,
            "units": maps.units
        }


def weeks_ago(number):
    return datetime.utcnow() - timedelta(weeks=number)


@app.route("/")
def hello():
    return "Hello world!"


@app.route("/rollback/<string:database>", methods=["GET"])
def rollback(database):
    rollback(database)
    return success("reverted")


@app.route("/migrate/<string:database>", methods=["GET"])
def migrate(database):
    return success("migrated") if migrate(database) else server_error()


@app.route("/drop/<string:database>", methods=["GET"])
def drop(database):
    return success("dropped") if drop_all_tables(database) else server_error()


@app.route("/maps/type/<string:category>/<string:database>", methods=["GET"])
def get_maps(category, database):
    session = get_session(database)
    try:
        if category:
            maps = list(map(maps_to_dict, session.query(Maps).filter(Maps.category == category).all()))
            if maps:
                return success(maps)
        return not_found()
    except Exception as error:
        handle_exception(error, session)
        return server_error()
    finally:
        session.close()


@app.route("/maps/save/<string:database>", methods=["POST"])
def add_map(database):
    session = get_session(database)
    try:
        maps = request.get_json()
        if len(maps["units"]) > 0:
            maps["category"] = "preDeployed"
        new_map = Maps(
            maps["name"],
            maps["category"],
            maps["maximumAmountOfPlayers"],
            maps["dimensions"],
            maps["terrain"],
            maps["buildings"],
            maps["units"]
        )
        creator = session.query(User).get(maps['creator'])
        if creator:
            new_map.creator = creator
        session.add(new_map)
        session.commit()
        return success(maps_to_dict(new_map))
    except Exception as error:
        handle_exception(error, session)
        return server_error()
    finally:
        session.close()


@app.route("/maps/remove/<int:map_id>/<string:database>", methods=["DELETE"])
def maps_remove(map_id, database):
    session = get_session(database)
    try:
        maps = session.query(Maps).get(map_id)
        if maps:
            session.delete(maps)
        session.commit()
        return success(maps_to_dict(maps))
    except Exception as error:
        handle_exception(error, session)
        return server_error()
    finally:
        session.close()


@app.route("/users/<string:origin>/<user_id>/<string:database>", methods=["GET"])
def user_by_id(origin, user_id, database):
    try:
        user = get_session(database).query(User).filter(getattr(User, origin) == user_id).first()
        if user:
            return success(user_to_dict(user))
        return not_found()
    except Exception as error:
        print(error)
        return server_error()


@app.route("/users/remove/<user_id>/<string:database>", methods=["DELETE"])
def user_remove(user_id, database):
    session = get_session(database)
    try:
        user = session.query(User).get(user_id)
        if user:
            session.delete(user)
        session.commit()
        return success(user_to_dict(user))
    except Exception as error:
        handle_exception(error, session)
        return server_error()
    finally:
        session.close()


@app.route("/users/login/<string:email>/<string:password>/<string:database>", methods=["GET"])
def user_login(email, password, database):
    # will deal with hashing etc when app is ready to go live
    session = get_session(database)
    try:
        user = user_by_email(email, session)
        if user and user.password == password:
            return success(user_to_dict(user))
        return exception(401)
    except Exception as error:
        handle_exception(error, session)
        return server_error()


@app.route("/users/save/<string:database>", methods=["POST"])
def user_save(database):
    session = get_session(database)
    user = request.get_json()
    try:
        email = user["email"]
        entry = user_by_email(email, session)
        if not entry:
            entry = User(
                email,
                user["last_name"],
                user["first_name"],
                user["name"]
            )
        entry = session.merge(entry)
        if "loginWebsite" in user:
            add_origin_id(entry, user["loginWebsite"], user["id"])
        session.commit()
        return success(user_to_dict(entry))
    except Exception as error:
        handle_exception(error, session)
        return server_error()
    finally:
        session.close()


@app.route("/games/saved/<user_id>/<string:database>", methods=["GET"])
def get_games(user_id, database):
    session = get_session(database)
    try:
        games = session.query(User).get(user_id).savedGames
        if len(games) > 0:
            return success(list(map(games_to_dict, games)))
    except Exception as error:
        handle_exception(error, False)
        return server_error()
    return not_found()


@app.route("/games/save/<string:database>", methods=["POST"])
def save_game(database):
    session = get_session(database)
    game = request.get_json()
    try:
        players = game['players']
        new_game = Games(
            game['name'],
            game['category'],
            game['map'],
            game['settings'],
            players
        )
        for player in players:
            user = session.query(User).get(player['id'])
            if user:
                new_game.users.append(user)
        if new_game.users:
            if 'id' in game and game['id']:
                previous = session.query(Games).get(game['id'])
                if previous:
                    session.merge(new_game)
            else:
                session.add(new_game)
        # remove saved games that haven't been touched in 3 weeks
        session.query(Games).filter(Games.date < weeks_ago(3)).delete()
        session.commit()
        return success(games_to_dict(new_game))
    except Exception as error:
        handle_exception(error, session)
        print(error)
        return server_error()
    finally:
        session.close()


@app.route("/games/remove/<game_id>/<string:database>", methods=["DELETE"])
def games_remove(game_id, database):
    session = get_session(database)
    try:
        game = session.query(Games).get(game_id)
        if game:
            session.delete(game)
        session.commit()
        return success(games_to_dict(game))
    except Exception as error:
        handle_exception(error, session)
        return server_error()
    finally:
        session.close()


def exception(code=500):
    return Response(json.dumps({"success": False}, separators=(',', ':')), code, mimetype="application/json")


def success(response):
    return Response(json.dumps({"success": True, "response": response}, separators=(',', ':')), 200,
                    mimetype="application/json")


@app.errorhandler(500)
def server_error():
    return exception(500)


@app.errorhandler(404)
def not_found():
    return exception(404)
