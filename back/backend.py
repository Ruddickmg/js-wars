from flask import Flask, request
from controllers.exceptions import exception, success
from controllers.games import get_games, save_game, remove_game
from controllers.maps import get_maps, save_map, remove_map
from controllers.users import get_user, save_user, remove_user, login
from database.db import handle_exception, rollback, create_tables, drop_all_tables, get_session

app = Flask(__name__)
db_arg = "database"


def handle_request(get=None, post=None, delete=None):
    database = request.args.get("database")
    session = get_session(database)
    handler = {
        "GET": get,
        "POST": post,
        "DELETE": delete,
    }.get(request.method)
    try:
        return handler(session)
    except Exception as error:
        handle_exception(error, session)
        return server_error()
    finally:
        session.close()


@app.route("/")
def hello():
    return "Hello world!"


@app.route("/rollback", methods=["GET"])
def rollback():
    rollback(request.args.get(db_arg))
    return success("reverted")


@app.route("/migrate", methods=["GET"])
def migrate():
    return success("migrated") if create_tables(request.args.get(db_arg)) else server_error()


@app.route("/drop", methods=["DELETE"])
def drop():
    return success("dropped") if drop_all_tables(request.args.get(db_arg)) else server_error()


@app.route("/games", methods=["GET", "POST", "DELETE"])
def game_requests():
    return handle_request(get_games, save_game, remove_game)


@app.route("/users", methods=["GET", "POST", "DELETE"])
def users():
    return handle_request(get_user, save_user, remove_user)


@app.route("/login", methods=["GET"])
def user_login():
    return handle_request(login)


@app.route("/maps", methods=["GET", "POST", "DELETE"])
def maps():
    return handle_request(get_maps, save_map, remove_map)


@app.errorhandler(400)
def invalid_parameters(message=""):
    return exception(400)


@app.errorhandler(500)
def server_error(message=""):
    return exception(500)


@app.errorhandler(404)
def not_found(message=""):
    return exception(404)
