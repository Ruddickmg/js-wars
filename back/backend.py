from flask import Flask, jsonify, request, g
import json
import logging
import db
from db import GetSession as Session

app = Flask(__name__)

logging.basicConfig(filename='/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log',level=logging.DEBUG)
#
@app.route("/")
def hello():
	return "Hello world!"

@app.route("/rollback")
def rollback():
	db.Rollback()
	return "rolling back..."

@app.route("/migrate")
def migrate():
	db.Migrate()
	return 'migrated'

@app.route("/drop")
def drop():
	db.DropAll()
	return 'dropped that ish'

@app.route('/maps/type/<string:category>', methods=['GET'])
def get_maps(category):
	try:
		if(category):
			session = Session()
			maps = []
			allMaps = session.query(db.Maps).filter_by(category=category).all()
			for map in allMaps:
				try:
					maps.append(json.loads(json.dumps({
						'name':map.name,
						'id':map.id,
						'players':map.players,
						'buildings':map.buildings,
						'dimensions':map.dimensions, 
						'terrain':map.terrain,
						'units':map.units
					}, separators=(',',':'))))

				except Exception as error:
					db.Teardown(error, session)

				finally:
					session.close()
			
			if(maps):
				logging.debug(maps)
				return json.dumps(maps)
		
		return jsonify({'error':'Not found'})

	except Exception as error:
		db.Teardown(error, False);
		return jsonify({'error':'Something is amiss...'})

@app.route('/maps/save', methods=['POST'])
def add_map():

	session = Session();
	map = request.json

	if len(map['units']) > 0:
		map.category = 'preDeployed'
	try:
		newMap = db.Maps(
			map['name'],
			map['category'],
			map['players'],
			map['dimensions'],
			map['terrain'],
			map['buildings'],
			map['units'],
			map['creator']
		)
		session.add(newMap)
		session.commit()

	except Exception as error:
		db.Teardown(error, session);
		return jsonify({'success':'false'})

	finally:
		session.close()

	return jsonify({'success':'true'})

@app.route('/maps/select/<int:map_id>', methods=['GET'])
def get_map(map_id):
	
	try:
		session = Session()

		# find map by provided id
		map = session.query(db.Maps).filter_by(id=map_id).first()

	except Exception as e:
		db.Teardown(e, session)

	finally:
		logging.debug(map)
		session.close()

	#if there is a map dump it to json
	if(map):

		#transform to json and send response
		return json.dumps({
			'name':map.name,
			'id':map.id,
			'players':map.players,
			'buildings':map.buildings,
			'dimensions':map.dimensions,
			'terrain':map.terrain,
			'units':map.units,
			'category':map.category
		}, separators=(',',':'))

	else:

		# respond with a notification that there was no map found
		return jsonify({'error':'Not found'})

@app.errorhandler(404)
def not_found(error):
	ret = jsonify({'error': 404})
	return app.make_response(ret, 404)

if __name__ == '__main__':
	app.run()