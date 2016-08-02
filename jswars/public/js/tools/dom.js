/* ------------------------------------------------------------------------------------------------------*\
    
    list of functions used to assist manipulating the dom

\* ------------------------------------------------------------------------------------------------------*/

module.exports = {

    // create a canvas to display the hovered map element in the hud
    createCanvas: function (id, object, dimensions) {

        var type = typeof object.type === 'function' ? object.type() : object.type;
        var clas = typeof object.class === 'function' ? object.class() : object.class;
        var canvas = document.createElement('canvas'); // create canvas
        var context = canvas.getContext(app.ctx); // get context

        // set width, height and id attributes
        canvas.setAttribute('width', dimensions.width);
        canvas.setAttribute('height', dimensions.height);
        canvas.setAttribute('id', type || on + id + 'Canvas');

        // return canvas info for further use
        return {
            canvas: canvas,
            context: context,
            type: type,
            class: clas
        };
    },

    createList: function (object, id, displayedAttributes, canvasId) {
        
        if (canvasId && displayedAttributes !== '*' && displayedAttributes.hasValue('canvas')) {
            // create canvas and add it to the object
            var canvas = this.createCanvas(canvasId, object, {width:128, height:128});
            object.canvas = canvas.canvas;
        }

        // get a list of property names
        var properties = Object.keys(object);

        // create an unordered list and give it the specified id
        var ul = document.createElement('ul');
        ul.setAttribute("id", id);
        if (object.id) ul.setAttribute('itemNumber', object.id);

        var ind = 0;

        // go through each property and create a list element for it, then add it to the ul;
        for (var i = 0; i < properties.length; i += 1) {

            // properties
            var props = properties[i];

            // only use properties specified in the displayed attributes array
            if (displayedAttributes === '*' || displayedAttributes.hasValue(props) || displayedAttributes.hasValue('num') && !isNaN(props)) {

                ind += 1;

                var property = typeof object[props] === 'function' ? object[props]() : object[props];
       
                if(property === undefined)
                    continue;

                // create list element and give it a class defining its value
                var li = document.createElement('li');
                li.setAttribute('class', props);
                if (object.index) li.setAttribute( id + 'Index', ind);
                if(object.hide) li.style.display = 'none';
                
                // if the list element is a canvas then append it to the list element
                if (props === 'canvas') li.appendChild(property);

                    // if the list is an object, then create another list with that object and append it to the li element
                else if( typeof (property) === 'object') {
                    var list = app.dom.createList(property, props, displayedAttributes);
                    li.appendChild(list.ul);

                    // if the list element is text, add it to the innerHTML of the li element
                } else li.innerHTML = property;

                // append the li to the ul
                ul.appendChild(li);
            }
        }
        
        // return the ul and canvas info
        return {
            ul: ul,
            canvas: canvas
        };
    },

    getDisplayedValue: function (id) {
        var element = document.getElementById(id);
        var children = element.childNodes;
        var len = children.length;
        for(c = 0; c < len; c += 1){
            var child = children[c];
            if(child.style.display !== 'none') 
                return child.getAttribute('class');
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

        var length = element.length;
        for (var e = 0; e < length; e += 1) {
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
    },

    hide: function (name) {
        var element = document.getElementById(name);
        element.hidden.style.visibility = 'hidden';
    },

    changeDefault: function (change, element) {
        
        var nodes = element.childNodes;

        for (var i = 0; i < nodes.length; i += 1){

            if (nodes[i].getAttribute('default')){
                nodes[i].style.display = 'none';
                nodes[i].removeAttribute('default');
            }

            if (nodes[i].getAttribute('class') === change)
                this.show(nodes[i]);
        }   
    },

    getDefault: function (element) {
        if (element){
            var i = 0, children = element.childNodes;
            if (children)
                while ((child = children[i++]))
                    if(child.getAttribute('default'))
                        return child.getAttribute('class');
        }
        return false;
    }
};