/* ------------------------------------------------------------------------------------------------------*\
   
   handles scrolling of text accross the screen, requires the id of the containing element, which must be 
   three elements, one a span, inside something else, inside something else. it also requires a message 
   to be displayed
   
\* ------------------------------------------------------------------------------------------------------*/

module.exports = function () {

    var position;

    var scrollText = function(container, message, footer, text, scroll){

        // if this is our first time through initialize all variables
        if(!text){
            text = document.getElementById(container);
            if(!text) throw "Dom element \"" + container + "\" not found"
            text.innerHTML = message;
            if(!position) position = -text.offsetWidth;
            scroll = text.parentNode;
            if(!scroll) throw "Two parent nodes required for scrolling, parent of dom element \"" + container + "\" not found"
            footer = scroll.parentNode;
            if(!footer) throw "Two parent nodes required for scrolling, the second parent of dom element \"" + container + "\" not found"
        }
        
        // if the element is no longer visable then stop
        if(!text.offsetParent){ 
            position = false; 
            return false 
        }

        // if the text has been changed then stop
        if(text.innerHTML !== message) {
            return false;
        }

        // compare the postion of the text to its containor
        if(position !== undefined){

            // if we are less then the container width then move right
            if(position <= footer.offsetWidth ){
                scroll.style.left = position + 'px';
                position += 3;
            }else{

                // otherwise reset the position to the left
                position = -text.offsetWidth * 4;
            }
        }
        setTimeout(function(){ scrollText(container, message, footer, text, scroll);}, 20);
    };

    return scrollText;
}();