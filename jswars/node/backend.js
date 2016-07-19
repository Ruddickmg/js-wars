/* ----------------------------------------------------------------------------------------------------------*\

    set up and handle ajaj calls to the database

\* ----------------------------------------------------------------------------------------------------------*/

var request = require('request');

module.exports = function (res, url) {

    if(!url) url = 'http://back-jswars.rhcloud.com';

    var handle = function (error, r, body) {
        if (r.headersSent) {
            console.log('  * Headers sent error');
            res.json({error:'headers sent'});
        }else if(r.statusCode == 500){
            console.log('  * Database error: failed response - error code 500');
            res.json({error:'db problems'});
        }else if(!error && r.statusCode == 200){
            var parsed = JSON.parse(body);
            res.json(parsed);
        }
        res.end();
    };

    var api_get = function (path, input) { return request(url + path + input, handle);};
    var api_post = function (path, input) {
        return request.post({
            headers: {'content-type' : 'application/json'},
            url: url + path,
            body: JSON.stringify(input)
        }, handle);
    };

    return {
        get_maps: function (category) {return api_get('/maps/type/', category);},
        get_map: function(id) { return api_get('/maps/select/', id);},
        save_map: function (map){return api_post('/maps/save', map);}
    };
};