/* ---------------------------------------------------------------------------------------------------------*\
    
    handle AJAJ calls
    
\* ---------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var ajaj = function (input, action, callback, url) {

        if ( !url ) throw new Error('No address specified for back end services');

        try{
          // Opera 8.0+, Firefox, Chrome, Safari
          var request = new XMLHttpRequest();
       }catch (e){
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

       request.onreadystatechange = function(){
            if (request.readyState == 4 && request.status == 200)
            {
                if (callback){
                    return callback(JSON.parse(request.responseText));
                }else{
                    // Javascript function JSON.parse to parse JSON data
                    return JSON.parse(request.responseText);
                }
            }
        }

        try {
            var ts = new Date().getTime();
            request.open(action, url+'?ts='+ts, true);
            request.setRequestHeader("Content-type","application/json;charset=UTF-8");
            request.send(JSON.stringify(input));
        }catch (e){
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
        }
    };
}();