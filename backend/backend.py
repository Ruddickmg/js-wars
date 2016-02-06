from flask import Flask, jsonify, request, g
import json
import logging
import db

app = Flask(__name__)

logging.basicConfig(filename='/var/lib/openshift/55f8fbf90c1e665752000019/app-root/logs/python.log',level=logging.DEBUG)

@app.route("/")
def hello():
	return "Hello World!"

@app.route("/migrate")
def migrate():
	db.Models.create_all()
	return 'migrated'

@app.route("/drop")
def drop():
	try:
		db.Models.reflect()
		db.Models.drop_all()
	except Exception as e:
		logging.debug(e)
		return 'not dropped'

	return 'dropped that ish'

@app.route('/maps/type/<string:category>', methods=['GET'])
def get_maps(category):
	try:
		if(category):
			maps = []
			allMaps = db.Maps.query.filter_by(category=category).all()
			for map in allMaps:
				try:
					maps.append(json.loads(json.dumps({
						'name':map.name,
						'id':map.id,
						'players':map.players,
						'buildings':map.buildings,
						'background':map.background, 
						'dimensions':map.dimensions, 
						'plain':map.plain, 
						'unit':map.unit
					}, separators=(',',':'))))

				except Exception as error:
					logging.debug(error)

			allMaps.close();
			if(maps):
				return json.dumps(maps)
		
		return jsonify({'error':'Not found'})

	except Exception as error:
		allMaps.rollBack()
		logging.debug(error)
		return jsonify({'error':'Something is amiss...'})

@app.route('/maps/save', methods=['POST'])
def add_map():

	map = request.json

	if len(map['unit']) > 0:
		map.category = 'preDeployed'

	try:
		newMap = db.Maps(map['name'], map['category'], map['players'], map['background'], map['dimensions'], map['plain'], map['terrain'], map['buildings'], map['unit'], map['creator'])

		db.Models.session.add(newMap)
		db.Models.session.commit()

	except Exception as error:
		logging.debug(error)
		return jsonify({'success':'false'})

	return jsonify({'success':'true'})

@app.route('/maps/select/<int:map_id>', methods=['GET'])
def get_map(map_id):

	# find map by provided id
	map = db.Maps.query.filter_by(id=map_id).first()

	#if there is a map dump it to json
	if(map):

		#transform to json and send response
		return json.dumps({
			'name':map.name,
			'id':map.id,
			'players':map.players,
			'buildings':map.buildings,
			'background':map.background, 
			'dimensions':map.dimensions,
			'terrain':map.terrain,
			'plain':map.plain, 
			'unit':map.unit,
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