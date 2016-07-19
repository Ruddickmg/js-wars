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
            if(!text) return false;
            text.innerHTML = message;
            if(!position) position = -text.offsetWidth;
            scroll = text.parentNode;
            footer = scroll.parentNode;
            if(!scroll || !footer) throw new Error('something up with the textual scroll, no parents.. needs parents');
        }
        
        // if the element is no longer visable then stop
        if(!text.offsetParent){ 
            position = false; 
            return false 
        }

        // if the text has been changed then stop
        if(text.innerHTML !== message) return false;
        
        // compare the postion of the text to its containor
        if(position !== undefined){

            // if we are less then the container width then move right
            if(position <= footer.offsetWidth ){
                scroll.style.left = position + 'px';
                position += 1;
            }else{

                // otherwise reset the position to the left
                position = -text.offsetWidth * 4;
            }
        }
        setTimeout(function(){ scrollText(container, message, footer, text, scroll);}, 10);
    };
    return scrollText;
}();