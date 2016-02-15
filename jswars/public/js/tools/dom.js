/* ------------------------------------------------------------------------------------------------------*\
    
    list of functions used to assist manipulating the dom

\* ------------------------------------------------------------------------------------------------------*/

module.exports = {

    getDisplayedValue: function (id) {
        var element = document.getElementById(id);
        var children = element.childNodes;
        var len = children.length;
        for(c = 0; c < len; c += 1){
            var child = children[c];
            if(child.style.display !== 'none') return child.getAttribute('class');
        }
    },
    
    // remove all children of dom element
    removeAllChildren: function (element, keep){
        while(element.firstChild) {
            var clear = element.firstChild;
            if (clear.id !== keep) {
                element.removeChild(clear);
            }else{
                var keeper = element.firstChild;
                element.removeChild(clear);
            }
        }
        if(keeper) element.appendChild(keeper);
    },

    // remove children of dom element
    removeChildren: function (element, keep){
        var remove = element.children;
        for (var c = 0; c < remove.length; c += 1) {
            var clear = remove[c];
            if (clear.id !== keep) {
                element.removeChild(clear);
            }
        }
    },
    
    // find each element by their tag name, get the element that matches the currently selected index and return it
    findElementByTag: function (tag, element, index) {
        var len = element.length;
        for (var e = 0; e < len; e += 1) {
            // element returns a string, so must cast the index to string for comparison
            // if the element tag value ( index ) is equal to the currently selected index then return it
            if (element[e].getAttribute(tag) === index.toString()) {
                return element[e];
            }
        }
    },

    getImmediateChildrenByTagName: function(element, type){
        var elements = [];
        if(element){
            var children = element.childNodes;
            var name = type.toUpperCase();
            var len = children.length;
            for(var i = 0; i < len; i += 1) {
                var child = children[i];
                if(child.nodeType === 1 && child.tagName === name) elements.push(child);
            }
        }
        return elements;
    },

    show: function (show, list, display){
        if(!display) var display = '';
        if(show){
            show.style.display = display;
            show.setAttribute('default', true );
            return show.getAttribute('class');
        }else{
            list[0].style.display = display;
            list[0].setAttribute('default', true);
            return list[0].getAttribute('class');
        }
    }
};