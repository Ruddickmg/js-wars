from flask import Flask, jsonify, request, g
import json, logging, db
from db import Maps, User, Games, Teardown, Rollback, Migrate, DropAll, Session

app = Flask(__name__)

logging.basicConfig(filename="/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log",level=logging.DEBUG)

def user_byEmail (email):
	return User.query.filter_by(email=email).first()

def addOriginId (user, origin, id):
	if (not getattr(user, origin) and ["facebook", "google", "twitter"].index(origin) >= 0):
			setattr(user, origin, id)

def user_toJson(user):

	#if there is a map dump it to json
	if (user):

		#transform to json and send response
		return json.dumps({
			"id":user.id,
			"email":user.email,
			"last_name":user.lastName,
			"first_name":user.firstName,
			"name":user.name,
		}, separators=(',',':'))

	else:

		# respond with a notification that there was no map found
		return jsonify({"error":"Not found"})

@app.route("/")
def hello():
	return "Hello world!"

@app.route("/rollback")
def rollback():
	Rollback()
	return "rolling back..."

@app.route("/migrate")
def migrate():
	if (Migrate()):
		return "migrated"
	return "error"

@app.route("/drop")
def drop():
	DropAll()
	return "dropped that ish"

@app.route("/maps/type/<string:category>", methods=["GET"])
def get_maps(category):
	try:
		if(category):

			maps = []
			allMaps = Maps.query.filter(Maps.category == category).all()

			for map in allMaps:
				try:
					maps.append(json.loads(json.dumps({
						"name":map.name,
						"id":map.id,
						"players":map.players,
						"buildings":map.buildings,
						"dimensions":map.dimensions, 
						"terrain":map.terrain,
						"units":map.units
					}, separators=(',',':'))))

				except Exception as error:
					Teardown(error, session)
			
			if(maps):
				return json.dumps(maps, separators=(',',':'))
		
		return jsonify({"error":"Not found"})

	except Exception as error:
		Teardown(error, False);
		return jsonify({"error":"Something is amiss..."})

@app.route("/maps/save", methods=["POST"])
def add_map():

	session = Session();
	map = request.get_json()

	if len(map["units"]) > 0:
		map.category = "preDeployed"

	try:
		newMap = Maps(
			map["name"],
			map["category"],
			map["players"],
			map["dimensions"],
			map["terrain"],
			map["buildings"],
			map["units"],
			map["creator"]
		)

		session.add(newMap)
		session.commit()

	except Exception as error:
		Teardown(error, session);
		return jsonify({"success":"false"})

	finally:
		session.close()

	return jsonify({"success":"true"})


@app.route("/users/<string:origin>/<int:id>", methods=["GET"])
def user_byId(origin, id):
	return user_toJson(User.query.filter(getattr(User, origin) == id).first())

@app.route("/users/login/<string:email>/<string:password>", methods=["GET"])
def user_login(email, password):	
	# will deal with hashing etc when app is ready to go live
	user = user_byEmail(email)
	if (user and user.password == password):
		return user_toJson(user)
	else:
	 	return jsonify({"error":"incorrect login info"});

@app.route("/users/save", methods=["POST"])
def user_save():

	session = Session()
	user = request.get_json()

	email = user["email"]
	entry = user_byEmail(email)

	try:
		if (not entry):
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

	result = user_toJson(entry)

	return result

@app.route ("/games/saved/<string:userId>", methods=["GET"])
def get_games(userId):
	try:

		user = User.query.get(userId)

		if (user):

			session = Session()
			saved = json.loads(user.saved);
			games = [];

			for id in saved:
				try:
					game = Games.query.get(id)

					if (game):
						games.append(json.loads(json.dumps({
							'id':game.gameId,
							'name':game.name,
							'map':game.map,
							'players':game.players,
							'saved':True
						}, separators=(',',':'))));

				except Exception as error:
					Teardown(error, session)

				finally:
					session.close()
			
			if (len(games) > 0):
				return json.dumps(games, separators=(',',':'))

	except Exception as error:
		Teardown(error, False);
		return jsonify({"error":"Something is amiss..."})

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

		if 'saved' in game and game['saved']:
			gameId = Games.query.filter(Games.gameId, newGame.gameId).first().id
		else:
			session.add(newGame)
			session.flush()
			gameId = newGame.id

		for player in players:

			id = player['id']

			if (id):
				user = session.query(User).get(id)

				if (user):
					saved = json.loads(user.saved)
					if (not gameId in saved):
						saved.append(gameId)
						user.saved = json.dumps(saved, separators=(',',':'))

		session.flush()
		session.commit()

	except Exception as error:
		Teardown(error, session)
		return jsonify({"success":"false"})

	finally:
		session.close()

	return jsonify({"success":"true"})

@app.errorhandler(404)
def not_found(error):
	return app.make_response(jsonify({"error": 404}), 404)

if __name__ == "__main__":
	app.run()