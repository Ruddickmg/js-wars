/* ---------------------------------------------------------------------------------------------------------*\
    
    handle AJAJ calls
    
\* ---------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var ajaj = function (input, action, callback, url) {

        if ( !url ) {
            
            throw new Error('No address specified for back end services');
        }

        try {

            // Opera 8.0+, Firefox, Chrome, Safari
            var request = new XMLHttpRequest();

        } catch (e){

            // Internet Explorer Browsers
            try{

               var request = new ActiveXObject("Msxml2.XMLHTTP");

            }catch (e) {

               try{

                  var request = new ActiveXObject("Microsoft.XMLHTTP");

               }catch (e){

                  // Something went wrong
                  alert("Your browser broke!");
                  return false;
               }
            }
        }

        request.onreadystatechange = function() {

            if (request.readyState == 4 && request.status == 200 && request.responseText) {

                return callback ? callback(JSON.parse(request.responseText)):
                    JSON.parse(request.responseText);
            }
        };

        try {

            request.open(action, url+'?ts='+(new Date().getTime()), true);
            request.setRequestHeader("Content-type","application/json;charset=UTF-8");
            request.send(JSON.stringify(input));

        } catch (e) {

            console.log(e);
            return false;
        }
    }
    return {
        post:function (input, url, callback){

            return ajaj(input, 'POST', callback, url);
        },

        get:function (input, url, callback) {

            return ajaj(input, 'GET', callback, url + '/' + input);
        },

        del: function (input, url, callback) {

            return ajaj(input, 'DELETE', callback, url + '/' + input);
        }
    };
}();