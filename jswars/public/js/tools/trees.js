//trees
module.exports = function () {

	var maxDepth = 1,

	opposite = function (direction) { return direction == 'right' ? 'left' : 'right'; },

	// single avl rotation
	rotate = function () {

		var rotation = function (root, direction, parent) {

			// get the label of the opposite leaf
			var opposition = opposite(direction);

			// change the root to whichever child we are looking at
			var newRoot = root[direction];

			// make the old root's leaf in the specified direction
			// the new root's (formerly child's) opposite leaf
			root[direction] = newRoot[opposition];

			// switch parents
			if(parent){
				newRoot.parent = root.parent;
			 	root.parent = newRoot;
			}

			// make the roots apposite leaf the old root (now child)
			newRoot[opposition] = root;

			return newRoot;
		}

		return {
			left:  function (n, p) {return n = rotation(n, 'left', p);},
			right: function (n, p) {return n = rotation(n,'right', p);}
		};
	}(),

	weight = function(input) { return !input.weight ? input : input.weight; },

	node = function (d, l, r) {
		return {
			left:l,
			right:r,
			data: d,
			dupes:0,
			leftCount:0
		};
	},

	find = function () {
		while (r){
			if(weight(d) < weight(r)){ 
				r = r.left;
			}else if(weight(d) > weight(r)){
				r = r.right;
			}else{
				return r == d ? r : false;
			}
		}
		return false;
	};

	return {

		avl: function (data) {

			// double avl rotation
			var rotateTwice = {
				left:  function (n) {
					rotate.right(n.left);
					return rotate.left(n);
				},
				right: function (n) { 
					rotate.left(n.right);
					return rotate.right(n);
				}
			},

			var depth = function (n) { return !n ? -1 : n.depth };

			var balance = function (node) {

				if(depth(node.left) - depth(node.right) > maxDepth)
					if(depth(node.left.left) >= depth(node.left.right))
						rotate.left(node);
					else
						rotateTwice.left(node);
				else if(depth(node.right) - depth(node.left))
					if(depth(node.right.right) >= depth(node.right.left))
						rotate.right(node);
					else
						rotateTwice.right(node);

				node.depth = ceil(depth(node.left) - depth(node.right)) + 1;
			};

			var avlNode = function (d, l, r) {
				var n = node(d);
				n.depth = 0;
				n.leftCount = 0;
				return n;
			};

			var root = avlNode(data);

			var insert = function (d, r) {

				if(d != r){

			        // if its less then the current root and it has a left child then check it, 
			        // otherwise set it to the d
			        if(weight(d) < weight(r)){

			        	// incriment the count of items on the left
			        	r.leftCount += 1;
			         	insert(d, r.left ? r.left : r.left = d);

			        // same except for the right child
			        }else if(weight(d) > weight(r)){ insert(d, r.right ? r.right : r.right = d);

			        // if they are equal then say a dupelicate has been found and break the loop
			        }else return r.dupes += 1;
			    }
		        return balance(r);
			};

			return {
				insert: function (d) { !root.data ? root = avlNode(d) : insert(avlNode(d), root); },
				// because i could and it was fun
				find: function (d) { 
					var r = root;
					while (r) weight(d) < weight(r) ? r.left == d ? return r.left : r = r.left : r.right == d ? return r.right : r = r.right;
				},
				remove: function (d) {
					var r = root;
					while (r){
						if(weight(d) < weight(r)){
							r.leftCount -= 1;
							r.left == d ? delete r.left : r = r.left;
						}else{
							r.right == d ? delete r.right : r = r.right;
						}
					}
				},
			}
		},

		splay: function (data) {

			var zigZag = {
				left:  function (n) {
					rotate.right(n.left, true);
					return rotate.left(n, true);
				},
				right: function (n) { 
					rotate.left(n.right, true);
					return rotate.right(n, true);
				}
			},

			var zigZig = {
				left: function (n) {return rotate.left(rotate.left(n.parent.parent,true),true);},
				right:function (n) {return rotate.right(rotate.right(n.parent.parent,true),true);}
			};

			var sNode = function (d) {
				var n = node(d);
				n.parent = false;
				return n;
			};

			var insert = function (d, r) {
				while (r !== d){
					if(weight(d) < weight(r)){ 
						if(r.left){
							r = r.left;
						}else{
							d.parent = r;
							r = r.left = d
						}
					}else if(weight(d) > weight(r)){
						r = r.right ? r.right : r = r.right = d;
					}else{
						return r.dupes += 1;
					}
				}
				return r;
			};

			var splayTree = sNode(data);

			var splay = function (n) {
				while(n.parent){
					if(n.parent.left === n){
						if(n.parent.parent){
							if(n.parent.parent.left === n.parent){
								n = zigZig.left(n);
							}else{
								n = zigZag.left(n.parent.parent);
							}
						}else{
							n = rotate.left(n);
						}
					}else{
						if(n.parent.parent){
							if(n.parent.parent.right === n.parent){
								zigZig.right(n);
							}else{
								zigZag.right(n.parent.parent);
							}
						}else{
							n = rotate.right(n);
						}
					}
				}
				return n;
			};

			min: function (s) {
				while (s.left) s = s.left;
				return s;
			};

			max: function (s) {
				while(s.right) s = s.right;
				return s;
			};

			var switchParents = function (n, direction) {
				var o = opposite(direction)
				var root = n[direction];
				var child = n[o];
				if(child) child.parent = root;
				root[o] = child;
				root.parent = false;
				delete n;
				return root;
			};
			
			var remove = function (n) {
				if(!n) return false;
				var r;
				if(!n.left.right) 
					r = switchParents(n,'left');
				else if(!n.right.left)
					r = switchParents(n, 'right');
				else 
					replace(n, min(n));
				return r;
			};

			return {
				insert: function (d) { !splayTree.data ? splayTree = sNode(d) : splay(insert(sNode(d), splayTree)); },
				remove: function (d) { remove(splay(find(d))) },
				find: function (d) {return splay(find(d))},
				min: function () {return splay(min(splayTree));},
				max: function () {return splay(max(splayTree));}
			};
		},

		B: function () {
			
		}
	};
}();