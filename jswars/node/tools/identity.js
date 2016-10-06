Heap = require('../../public/js/tools/binaryHeap.js');
Identity = function (init) {
    this.id = init || 0;
};
Identity.prototype.unused = new Heap().setToMax();
Identity.prototype.empty = function () { return !this.unused.size(); };
Identity.prototype.recycle = function () {
    var id = this.unused.pop();
    if (this.id <= id) this.id -= 1;
    return id;
};
Identity.prototype.remove = function (id) {this.unused.push(id);};
Identity.prototype.get = function () { return this.empty() ? (this.id += 1) : this.recycle();};
module.exports = Identity;