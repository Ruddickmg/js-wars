/* ------------------------------------------------------------------------------------------------------*\
    
    takes a string as an optional argument, this string is used as the name of a property 
    in a potential object to be compared when assessing its value in relation to the 
    other heap elements

\* ------------------------------------------------------------------------------------------------------*/

Heap = function (property) { 
    // create the heap
    this.heap = []; 
    this.property = property;

};
// make a max heap instead of a min heap;
Heap.prototype.setToMax = function () {this.max = true; return this;};

// swaps the parent index with the child, returns child's new index (parent index)
// subtract one from each input to compensate for the array starting at 0 rather then 1
Heap.prototype.swap = function (index, parentIndex) {
    this.heap[index - 1] = this.heap.splice(parentIndex - 1, 1, this.heap[index - 1])[0]; 
    return parentIndex;
};

// get the value at the input index, compensate for whether there is a property being accessed or not
Heap.prototype.value = function (index) { return this.property ? this.heap[index - 1][this.property] : this.heap[index - 1];};

// calculate the parent index
Heap.prototype.parent = function (index) {return Math.floor(index/2)};

// calculate the indexes of the left and right
Heap.prototype.left = function (i) {return i * 2;};
Heap.prototype.right = function (i) {return this.left(i) + 1;};

// compare the values at the two supplied indexes, return the result of whether input l is greater then input r
Heap.prototype.lt = function(l,r) {return this.value(l) < this.value(r);};
Heap.prototype.gt = function(l,r) {return this.value(l) > this.value(r);};
Heap.prototype.inequality = function (l,r) {return this.max ? this.gt(l,r) : this.lt(l,r);};

// if we are at the start of the array or the current nodes value is greater then its parent then return the current 
// index (compensate for 0), otherwise swap the parent and child then repeat from the childs new position
Heap.prototype.bubble = function (index) {
    while (index >= 2 && !this.inequality (this.parent(index), index))
        index = this.swap(index, this.parent(index));
    return index - 1;
};

Heap.prototype.sort = function (index) {

    var l, r, length = this.heap.length;

    while (length > (l = this.left(index)))
        index = this.swap(index, length > (r = this.right(index)) && this.inequality(r,l) ? r : l)

    this.swap(index, length); 
    this.bubble(index);

    return this.heap.pop();
};

// add a value to the heap
Heap.prototype.push = function (value) {
    this.heap.push(value); 
    return this.bubble(this.heap.length);
},

// remove and return the top item from the heap
Heap.prototype.pop = function () {return this.sort(1);},

// return the first value of the heap (lowest)
Heap.prototype.min = function () {return this.heap.slice(0,1)[0];},

// return the amount of elements in the heap (array)
Heap.prototype.size = function () {return this.heap.length;}

module.exports = Heap;