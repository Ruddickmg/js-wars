/* ------------------------------------------------------------------------------------------------------*\
    
    takes a string as an optional argument, this string is used as the name of a property 
    in a potential object to be accessed while assessing its value in relation to the 
    other heap elements

\* ------------------------------------------------------------------------------------------------------*/

module.exports = function (property) { 

    // create the heap
    var heap = []; 

    // swaps the parent index with the child, returns child's new index (parent index)
    // subtract one from each input to compensate for the array starting at 0 rather then 1
    var swap = function (index, parentIndex) {
        heap[index - 1] = heap.splice(parentIndex - 1, 1, heap[index - 1])[0]; 
        return parentIndex;
    };

    // get the value at the input index, compensate for whether there is a property being accessed or not
    var value = function (index) {return property ? heap[index - 1][property] : heap[index - 1];};

    // calculate the parent index
    var parent = function (index) {return Math.floor(index/2)};

    // calculate the indexes of the left and right
    var left = function (i) {return i * 2;};
    var right = function (i) {return left(i) + 1;};

    // compare the values at the two supplied indexes, return the result of whether input l is greater then input r
    var lt = function(l,r) {return value(l) < value(r);};

    // if we are at the start of the array or the current nodes value is greater then its parent then return the current 
    // index (compensate for 0), otherwise swap the parent and child then repeat from the childs new position
    var bubble = function (index) {return index < 2 || lt(parent(index), index) ? index - 1 : bubble(swap(index, parent(index)));};

    var sort = function (index) {
        var l = left(index), r = right(index), length = heap.length;

        // if there are no more childnodes, swap the value at the current index with the value at
        // end of the array, sort the value at the current index then remove and return the 
        // last array element (the minimum element)
        if (length <= l) {swap(index, length); bubble(index); return heap.pop();}

        // if the right node is in range and less then the left node then swap 
        // the child with the right node, otherwise swap with the left
        return sort(swap(index, length > r && lt(r,l) ? r : l ));
    };

    return {
        // add a value to the heap
        push: function (value) {heap.push(value); return bubble(heap.length);},

        // remove and return the top item from the heap
        pop: function () {return sort(1);},

        // return the first value of the heap (lowest)
        min: function () {return heap.slice(0,1)[0];},

        // return the amount of elements in the heap (array)
        size: function () {return heap.length;},

        // update an element in the heap, has an optional property argument used for accessing object properties
        update: function (index, value, property) {
            if(property){
                heap[index][property] = value;
            }else{
                heap.splice(index, 1, value);
            }
            return bubble(index + 1);
        }
    };
};