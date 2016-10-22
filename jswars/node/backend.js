/* ----------------------------------------------------------------------------------------------------------*\

    set up and handle ajaj calls to the database

\* ----------------------------------------------------------------------------------------------------------*/

var request = require("request");

module.exports = function (res, url) {

    if(!url) url = "http://back-jswars.rhcloud.com";
    var response, callback = false;
    var handle = function (error, r, body) {
        if (error) console.log(error);
        if (r) {
            if (r.headersSent) {
                console.log("  * Headers sent error");
                res.json({error:"headers sent"});
            }else if(r.statusCode == 500){
                console.log("  * Database error: failed response - error code 500");
                res.json({error:"db problems"});
            }else if(!error && r.statusCode == 200){
                response = JSON.parse(body);
                res.json(response);
                if (callback && response && !response.error) 
                    callback(response);
            }
        } else console.log("  * No response recieved from database - in request.js");
        res.end();
    };

    var api_get = function (path, input) { return request(url + path + "/" + input, handle);};
    var api_post = function (path, input) {
        return request.post({
            headers: {"content-type" : "application/json"},
            url: url + path,
            body: JSON.stringify(input)
        }, handle);
    };

    return {
        callback: function (cb) {callback = cb; return this;},
        save_map: function (map) {return api_post("/maps/save", map);},
        get_maps: function (category) {return api_get("/maps/type", category);},
        save_user: function (user) {return api_post("/users/save", user);},
        get_user: function (origin, id) {return api_get("/users",(origin+"/"+id));},
        get_login: function (email, password) {return api_get("/users/login", (email+"/"+password));},
        get_games: function (id) {return api_get("/games/saved", id)},
        save_game: function (game) {return api_post("/games/save", game);},
    };
};