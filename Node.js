"use strict";

//create a structure to treat a set of objects as one
var Node = function() {
    this.children = [];
    this.localMatrix = utils.identityMatrix(); //the matrix that change the position of the child with respect to the parent
    this.worldMatrix = utils.identityMatrix(); //place the object in the world space
};
Node.prototype.setParent = function(parent) {
    // if the object already has a preavoius parent it remove it to give it to another parent
    if (this.parent) {
        var ndx = this.parent.children.indexOf(this);
        if (ndx >= 0) {
            this.parent.children.splice(ndx, 1);
        }
    }
    // Add us to our new parent
    if (parent) {
        parent.children.push(this);
    }
    this.parent = parent;
};
Node.prototype.updateWorldMatrix = function(matrix) { //call it just from the parent
    if (matrix) {
        // a matrix was passed in so do the math
        this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
    } else {
        // no matrix was passed in so just copy.
        utils.copy(this.localMatrix, this.worldMatrix);
    }
    // now process all the children
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function(child) {
        child.updateWorldMatrix(worldMatrix);
    });
};
