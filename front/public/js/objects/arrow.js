Arrow = function (d) {
    this.direction = d;
    this.arrowBackground = document.createElement('div');
    this.arrowBackground.setAttribute('id', d + 'ArrowBackground');
    this.arrowBackground.setAttribute('class', d + 'Arrow');

    this.arrowOutline = document.createElement('div');
    this.arrowOutline.setAttribute('id', d +'ArrowOutline');
    this.arrowOutline.setAttribute('class', d + 'Arrow');
    this.arrowOutline.appendChild(this.arrowBackground);

    var existing = document.getElementById(this.arrowOutline.id);
    if (existing) existing.parentNode.replaceChild(this.arrowOutline, existing);
};
Arrow.prototype.width = function () {return this.w;};
Arrow.prototype.setWidth = function (width) {this.w = width;};
Arrow.prototype.side = {
    up:'Bottom',
    down:'Top',
    left:'Right',
    right:'Left'
};
Arrow.prototype.setColor = function (color) {this.background().style['border'+this.side[this.direction]+'Color'] = color;};
Arrow.prototype.outline = function () { return this.arrowOutline; };
Arrow.prototype.background = function () { return this.arrowBackground; };
Arrow.prototype.height = function (height) { this.outline().style.top = height + 'px'; };
Arrow.prototype.setLeft = function (left) { this.outline().style.left = left + 'px';};
Arrow.prototype.setTop = function (top) {this.outline().style.top = top + 'px';};
Arrow.prototype.setPosition = function (x, y) { 
    this.setLeft(x); 
    this.setTop(y); 
};
Arrow.prototype.remove = function () {
    var outline = this.outline();
    outline.parentNode.removeChild(outline);
};
Arrow.prototype.setSize = function (size) {
    var border = size / 4, arrow = this.outline(), background = this.background(), type = this.direction;
    this.setWidth(size);
    background.style.left = border - size + 'px'; 
    if(type === 'up'){
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    }else if(type === 'down'){
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderBottomWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderBottomWidth = size - 2 + 'px';
    }else if(type === 'left'){
        arrow.style.borderLeftWidth = size + 'px';
        arrow.style.borderBottomWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderLeftWidth = size - border + 'px';
        background.style.borderBottomWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    }else if(type === 'right'){
        arrow.style.borderBottomWidth = size + 'px';
        arrow.style.borderRightWidth = size + 'px';
        arrow.style.borderTopWidth = size + 'px';
        background.style.borderBottomWidth = size - border + 'px';
        background.style.borderRightWidth = size - border + 'px';
        background.style.borderTopWidth = size - border + 'px';
    }
    return this;
};