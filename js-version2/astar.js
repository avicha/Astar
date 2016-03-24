"use strict";
var Point = function(row, column) {
    this.row = row;
    this.column = column;
    this.state = 0;
    this.closed = false;
    this.d = this.w = this.f = 0;
    return this;
};
Point.prototype.setState = function(state) {
    this.state = state;
    return this;
};
Point.prototype.getState = function() {
    return this.state;
};
Point.prototype.setD = function(d) {
    this.d = d;
    this.f = this.d + this.w;
    return this;
};
Point.prototype.getD = function() {
    return this.d;
};
Point.prototype.setW = function(w) {
    this.w = w;
    this.f = this.d + this.w;
    return this;
};
Point.prototype.getW = function() {
    return this.w;
};
Point.prototype.getF = function() {
    return this.f;
};
Point.prototype.setParent = function(parent) {
    this.parent = parent;
    return this;
};
Point.prototype.getParent = function() {
    return this.parent;
};
Point.prototype.close = function() {
    this.closed = true;
    return this;
};
Point.prototype.isClosed = function() {
    return this.closed;
};
var TileMap = function(row, column) {
    this._data = [];
    this._opened = [];
    this.row = row;
    this.column = column;
    for (var i = 0; i < row; i++) {
        this._data[i] = [];
        for (var j = 0; j < column; j++) {
            this._data[i][j] = new Point(i, j);
        }
    }
    return this;
};
TileMap.prototype.setBlocks = function(blocks) {
    blocks.forEach(function(block) {
        var row = Math.floor(block / this.column);
        var column = block % this.column;
        this._data[row][column].setState(1);
    }.bind(this));
    return this;
};
TileMap.prototype.getPoint = function(row, column) {
    return this._data[row][column];
};
TileMap.prototype.startAt = function(row, column) {
    this.startRow = row;
    this.startColumn = column;
    return this;
};
TileMap.prototype.endAt = function(row, column) {
    this.endRow = row;
    this.endColumn = column;
    return this;
};
TileMap.prototype.evaluateW = function(startPoint, endPoint) {
    return Math.abs(endPoint.row - startPoint.row) + Math.abs(endPoint.column - startPoint.column);
};
TileMap.prototype.getOpenedPoints = function(point) {
    var points = [];
    var row = point.row,
        column = point.column;
    if (row) {
        var up = this._data[row - 1][column];
        if (!up.getState() && !up.isClosed() && up !== point.getParent()) {
            points.push(up);
        }
    }
    if (column + 1 < this.column) {
        var right = this._data[row][column + 1];
        if (!right.getState() && !right.isClosed() && right !== point.getParent()) {
            points.push(right);
        }
    }
    if (row + 1 < this.row) {
        var down = this._data[row + 1][column];
        if (!down.getState() && !down.isClosed() && down !== point.getParent()) {
            points.push(down);
        }
    }
    if (column) {
        var left = this._data[row][column - 1];
        if (!left.getState() && !left.isClosed() && left !== point.getParent()) {
            points.push(left);
        }
    }
    return points;
};
TileMap.prototype.resolve = function() {
    var startPoint = this._data[this.startRow][this.startColumn];
    var endPoint = this._data[this.endRow][this.endColumn];
    startPoint.setD(0);
    startPoint.setW(this.evaluateW(startPoint, endPoint));
    this._opened.push(startPoint);
    while (this._opened.length) {
        var point = this._opened.shift();
        if (point === endPoint) {
            this.sequence = [];
            this.shortestDis = point.getD();
            while (point) {
                this.sequence.splice(0, 0, point.row * this.column + point.column);
                point.setState(2);
                point = point.getParent();
            }
            break;
        } else {
            var points = this.getOpenedPoints(point);
            if (points.length) {
                points.forEach(function(p) {
                    var d = point.getD() + 1;
                    var w = this.evaluateW(p, endPoint);
                    if (!p.getF()) {
                        p.setD(d);
                        p.setW(w);
                        p.setParent(point);
                        this._opened.push(p);
                    } else {
                        if (p.getD() > d) {
                            p.setD(d);
                            p.setW(w);
                            p.setParent(point);
                        }
                    }
                }.bind(this));
            }
            point.close();
            this._opened.sort(function(a, b) {
                return a.getF() - b.getF();
            });
        }
    }
    return this.sequence;
};
TileMap.prototype.reset = function() {
    this._opened = [];
    this.sequence = null;
    this.startRow = this.startColumn = this.endRow = this.endColumn = 0;
    this._data.forEach(function(rowData) {
        rowData.forEach(function(p) {
            p.setD(0);
            p.setW(0);
            if (p.getState() == 2) {
                p.setState(0);
            }
            p.setParent(null);
            p.closed = false;
        });
    })
};
TileMap.prototype.toString = function() {
    return this._data.map(function(rowData) {
        return rowData.map(function(p) {
            return p.getState();
        });
    }).join('\n');
};