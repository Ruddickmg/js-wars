/* ----------------------------------------------------------------------------------------------------------*\

    The animate functions insert the draw methods into the specified canvas for rendering and then make a 
    call to the canvas to render those drawings with the render method. Calling the render method of an
    initialized canvas object will render the animations once. If a loop is wanted ( for changing animations 
    for example ), you may pass the parent function into the render function to be called recursively.

\*-----------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = function (objectName, hide) {
    window.requestAnimationFrame(function(){
        if(typeof objectName === 'string')
            app[objectName + 'Canvas'].setAnimations(app['draw' + objectName.uc_first()]).render(hide);
        else for(var i = 0; i < objectName.length; i += 1) 
            app[objectName[i] + 'Canvas'].setAnimations(app['draw' + objectName[i].uc_first()]).render(hide);
    });
};