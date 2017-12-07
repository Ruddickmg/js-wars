from flask import Flask, jsonify, request, Response
from datetime import datetime, timedelta
import json, logging, db, os
from db import Maps, User, Games, Teardown, Rollback, Migrate, DropAll, Session

app = Flask(__name__) 
app.config["SQLALCHEMY_DATABASE_URI"] = db.GetUrl()

def user_byEmail (email):
	return User.query.filter_by(email=email).first()

def addOriginId (user, origin, id):
	if not getattr(user, origin) and ["facebook", "google", "twitter"].index(origin) >= 0:
		setattr(user, origin, id)

def user_toDict(user):
	if user:
		return {
			"id":user.id,
			"email":user.email,
			"last_name":user.lastName,
			"first_name":user.firstName,
			"name":user.name
		}

def games_toDict(game):
	if game:
		return {
			"id":game.id,
			"name":game.name,
			"category":game.category,
			"map":game.map,
			"settings":game.settings,
			"players":[],
			"saved":game.players
		}

def maps_toDict(maps):
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

def weeksAgo(number):
	return datetime.utcnow() - timedelta(weeks=number)

@app.route("/")
def hello():
	return "Hello world!"

@app.route("/rollback", methods=["GET"])
def rollback():
	Rollback()
	return success("reverted")

@app.route("/migrate", methods=["GET"])
def migrate():
	return success("migrated") if Migrate() else serverError()

@app.route("/drop", methods=["GET"])
def drop():
	return success("dropped") if DropAll() else serverError()

@app.route("/maps/type/<string:category>", methods=["GET"])
def get_maps(category):
	session = Session()
	try:
		if category:
			maps = list(map(maps_toDict, Maps.query.filter(Maps.category == category).all()))
			if (maps):
				return success(maps)
		return not_found()
	except Exception as error:
		Teardown(error, session);
		return serverError()
	finally:
		session.close()

@app.route("/maps/save", methods=["POST"])
def add_map():
	session = Session();
	try:
		maps = request.get_json()
		if len(maps["units"]) > 0:
			maps["category"] = "preDeployed"
		newMap = Maps(
			maps["name"],
			maps["category"],
			maps["maximumAmountOfPlayers"],
			maps["dimensions"],
			maps["terrain"],
			maps["buildings"],
			maps["units"]
		)
		creator = User.query.get(maps['creator'])
		if creator:
			newMap.creator = creator
		session.add(newMap)
		session.commit()
		return success(maps_toDict(newMap))
	except Exception as error:
		Teardown(error, session);
		return serverError()
	finally:
		session.close()

@app.route("/maps/remove/<int:id>", methods=["DELETE"])
def maps_remove(id):
	session = Session()
	try:
		maps = Maps.query.get(id)
		if maps:
			session.delete(maps)
		session.commit()
		return success(maps_toDict(maps))
	except Exception as error:
		Teardown(error, session);
		return serverError()
	finally:
		session.close()

@app.route("/users/<string:origin>/<int:id>", methods=["GET"])
def user_byId(origin, id):
	try:
		user = User.query.filter(getattr(User, origin) == id).first()
		if (user):
			return success(user_toDict(user))
		return not_found()
	except Exception as error:
		print (error)
		return serverError()

@app.route("/users/remove/<int:id>", methods=["DELETE"])
def user_remove(id):
	session = Session()
	try:
		user = User.query.get(id)
		if (user):
			session.delete(user)
		session.commit()
		return success(user_toDict(user))
	except Exception as error:
		Teardown(error, session)
		return serverError()
	finally:
		session.close()

@app.route("/users/login/<string:email>/<string:password>", methods=["GET"])
def user_login(email, password):	
	# will deal with hashing etc when app is ready to go live
	try:
		user = user_byEmail(email)
		if user and user.password == password:
			return success(user_toDict(user))
		return exception(401)
	except Exception as error:
		Teardown(error, session)
		return serverError()

@app.route("/users/save", methods=["POST"])
def user_save():
	session = Session()
	user = request.get_json()
	try:
		email = user["email"]
		entry = user_byEmail(email)
		if not entry:
			entry = User(
				email,
				user["last_name"],
				user["first_name"],
				user["name"]
			) 
		entry = session.merge(entry)
		if ("loginWebsite" in user):
			addOriginId(entry, user["loginWebsite"], user["id"])
		session.commit()
		return success(user_toDict(entry))
	except Exception as error:
		Teardown(error, session);
		return serverError()
	finally:
		session.close()

@app.route ("/games/saved/<string:userId>", methods=["GET"])
def get_games(userId):
	try:
		games = User.query.get(userId).savedGames
		if len(games) > 0:
			return success(list(map(games_toDict, games)))
	except Exception as error:
		Teardown(error, False);
		return serverError()
	return not_found()

@app.route("/games/save", methods=["POST"])
def save_game():
	session = Session()
	game = request.get_json()
	try:
		players = game['players']
		newGame = Games(
			game['name'],
			game['category'],
			game['map'],
			game['settings'],
			players
		)
		for player in players:
			user = User.query.get(player['id'])
			if (user):
				newGame.users.append(user)
		if newGame.users:
			if 'id' in game and game['id']:
				previous = Games.query.get(game['id'])
				if previous:
					session.merge(newGame)
			else:
				session.add(newGame)
		# remove saved games that havent been touched in 3 weeks
		session.query(Games).filter(Games.date < weeksAgo(3)).delete()
		session.commit()
		return success(games_toDict(newGame))
	except Exception as error:
		Teardown(error, session)
		print (error)
		return serverError()
	finally:
		session.close()

@app.route("/games/remove/<int:id>", methods=["DELETE"])
def games_remove(id):
	session = Session()
	try:
		game = Games.query.get(id)
		if game:
			session.delete(game)
		session.commit()
		return success(games_toDict(game))
	except Exception as error:
		Teardown(error, session);
		return serverError()
	finally:
		session.close()

def exception(code=500):
	return Response(json.dumps({"success": False}, separators=(',',':')), code, mimetype="application/json")

def success(response=""):
	return Response(json.dumps({"success": True, "response": response}, separators=(',',':')), 200, mimetype="application/json")

@app.errorhandler(500)
def serverError(error=""):
	return exception(500)

@app.errorhandler(404)
def not_found(error=""):
	return exception(404)