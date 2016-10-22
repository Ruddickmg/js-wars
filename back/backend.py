from flask import Flask, jsonify, request, g
import json, logging, db
from db import Maps, User, Games, Teardown, Rollback, Migrate, DropAll, Session

app = Flask(__name__)

logging.basicConfig(filename="/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log",level=logging.DEBUG)

def user_byEmail (email):
	try:
		return User.query.filter_by(email=email).first()

	except Exception as error:
		Teardown(error, session);
		return jsonify({"success":"false"})

def addOriginId (user, origin, id):
	if not getattr(user, origin) and ["facebook", "google", "twitter"].index(origin) >= 0:
		setattr(user, origin, id)

def user_toDict(user):
	try:
		if user:
			return {
				"id":user.id,
				"email":user.email,
				"last_name":user.lastName,
				"first_name":user.firstName,
				"name":user.name
			}
	except Exception as e:
		return e

def games_toDict(game):
	try:
		if game:
			return {
				"id":game.id,
				"name":game.name,
				"map":game.map,
				"settings":game.settings,
				"players":game.players,
				"saved":True
			}

	except Exception as e:
		return e


def maps_toDict(maps):
	try:
		if maps:
			return {
				"name":maps.name,
				"id":maps.id,
				"players":maps.players,
				"buildings":maps.buildings,
				"dimensions":maps.dimensions, 
				"terrain":maps.terrain,
				"units":maps.units
			}
	except Exception as e:
		return e

@app.route("/")
def hello():
	return "Hello world!"

@app.route("/rollback")
def rollback():
	Rollback()
	return "rolling back..."

@app.route("/migrate")
def migrate():
	if Migrate():
		return "migrated"
	return "error"

@app.route("/drop")
def drop():
	DropAll()
	return "dropped that ish"

@app.route("/maps/type/<string:category>", methods=["GET"])
def get_maps(category):
	session = Session()
	try:
		if category:
			maps = list(map(maps_toDict, Maps.query.filter(Maps.category == category).all()))
			if(maps):
				return json.dumps(maps, separators=(',',':'))

		return jsonify({"error":"Not found"})

	except Exception as error:
		Teardown(error, session);
		return jsonify({"error":"Something is amiss..."})

	finally:
		session.close()

@app.route("/maps/save", methods=["POST"])
def add_map():
	session = Session();
	maps = request.get_json()

	if len(maps["units"]) > 0:
		maps["category"] = "preDeployed"

	try:
		newMap = Maps(
			maps["name"],
			maps["category"],
			maps["players"],
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

	except Exception as error:
		Teardown(error, session);
		return jsonify({"success":"false"})

	finally:
		session.close()

	return jsonify({"success":"true"})

@app.route("/maps/remove/<int:id>", methods=["DELETE"])
def maps_remove(id):
	session = Session()
	try:
		maps = Maps.query.get(id)
		if maps:
			session.delete(maps)
		session.commit()

	except Exception as error:
		Teardown(error, session);
		return jsonify({"success":"false"})

	finally:
		session.close()

@app.route("/users/<string:origin>/<int:id>", methods=["GET"])
def user_byId(origin, id):
	return json.dumps(user_toDict(User.query.filter(getattr(User, origin) == id).first()), separators=(',',':'))

@app.route("/users/remove/<int:id>", methods=["DELETE"])
def user_remove(id):
	session = Session()
	try:
		user = User.query.get(id)
		if (user):
			session.delete(user)
		session.commit()

	except Exception as error:
		Teardown(error, session);
		return jsonify({"success":"false"})

	finally:
		session.close()

@app.route("/users/login/<string:email>/<string:password>", methods=["GET"])
def user_login(email, password):	
	# will deal with hashing etc when app is ready to go live
	user = user_byEmail(email)
	if user and user.password == password:
		return json.dumps(user_toDict(user))
	else:
	 	return jsonify({"error":"incorrect login info"});

@app.route("/users/save", methods=["POST"])
def user_save():
	
	session = Session()
	user = request.get_json()
	email = user["email"]
	entry = user_byEmail(email)

	try:
		if not entry:
			entry = User(
				email,
				user["last_name"],
				user["first_name"],
				user["name"]
			)

		addOriginId(entry, user["origin"], user["id"])
		session.merge(entry)
		session.commit()

	except Exception as error:
		Teardown(error, session);
		return jsonify({"success":"false"})

	finally:
		session.close()

	result = json.dumps(user_toDict(entry))

	return result

@app.route ("/games/saved/<string:userId>", methods=["GET"])
def get_games(userId):
	try:
		games = User.query.get(userId).savedGames
		if len(games) > 0:
			return json.dumps(list(map(games_toDict, games)), separators=(',',':'))

	except Exception as error:
		Teardown(error, False);
		return jsonify({"error":"db error"})

	return jsonify({"error":"Not found"})


@app.route("/games/save", methods=["POST"])
def save_game():
	
	session = Session()
	game = request.get_json()
	players = game['players']

	try:
		newGame = Games(
			game['id'],
			game['name'],
			game['map'],
			game['settings'],
			players
		)

		for player in players:
			user = User.query.get(player['id'])
			if (user):
				newGame.users.append(user)

		if 'saved' in game and game['saved']:
			previous = Games.query.filter(Games.gameId, newGame.gameId).first()
			if previous:
				newGame.id = previous.id
				session.merge(newGame)
		else:
			session.add(newGame)

		session.commit()

	except Exception as error:
		Teardown(error, session)
		return jsonify({"success":"false"})

	finally:
		session.close()

	return jsonify({"success":"true"})

@app.route("/games/remove/<int:id>", methods=["DELETE"])
def games_remove(id):

	session = Session()
	try:
		game = Maps.query.filter(game.gameId, id).first()
		if game:
			session.delete(game)
		session.commit()

	except Exception as error:
		Teardown(error, session);
		return jsonify({"success":"false"})

	finally:
		session.close()

@app.errorhandler(404)
def not_found(error):
	return app.make_response(jsonify({"error": 404}))

if __name__ == "__main__":
	app.run()