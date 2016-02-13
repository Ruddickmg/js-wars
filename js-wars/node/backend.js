/* ----------------------------------------------------------------------------------------------------------*\

    set up and handle ajaj calls to the database

\* ----------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var url = 'http://back-jswars.rhcloud.com';

    var handle = function (value) {
        try{
            var req = value;
        }catch (e){
            console.log(e);
            req.abort();
            return {error:'get error'};
        }
        return req;
    };

    var callback = function(response, res){
        var parsed = JSON.parse(response);
        console.log(response);
        res.json(parsed);
        res.end();
    };

    var api_get = function (path, input, res) {
        if (res.headersSent) {
            console.log(res);
            console.log('whaaa?');
        }else{
            return handle(request(url + path + input, function (error, response, body) {
                if (!error && response.statusCode == 200){
                    callback(body, res);
                }else{
                    console.log(response.statusCode);
                }
            }));
        }
    };

    var api_post = function (path, input, res) {
        if (res.headersSent) {
            console.log(res);
        }else{
            return handle(request.post({
                headers: {'content-type' : 'application/json'},
                url: url + path,
                body: JSON.stringify(input)
            }, function (error, response, body) {
                if (!error && response.statusCode == 200){
                    callback(body, res);
                }else{
                    console.log(response.statusCode);
                }
            }));
        }
    };

    return {
        get_maps: function (category, res) {
            return api_get('/maps/type/', category, res);  
        },
        get_map: function(id, res) {
            return api_get('/maps/select/', id, res);
        },
        save_map: function (map, res){
            return api_post('/maps/save', map, res);
        }
    };
}();