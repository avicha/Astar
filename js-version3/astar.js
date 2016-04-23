"use strict";
/**
 * [Point 定义点类]
 * @param {[int]} row    [点位于的行]
 * @param {[int]} column [点位于的列]
 */
var Point = function(row, column) {
    this.row = row;
    this.column = column;
    //默认无障碍物
    this.state = 0;
    //初始化权重为0
    this.d = this.w = this.f = 0;
    this.closed = false;
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
/**
 * [isExtended 是否已经被扩展]
 * @return {Boolean} [description]
 */
Point.prototype.isExtended = function() {
    return !!this.f;
};
/**
 * [close 标记该节点扩展了]
 * @return {[type]} [description]
 */
Point.prototype.close = function() {
    this.closed = true;
    return this;
};
/**
 * [isClosed 是否已经扩展]
 * @return {Boolean} [description]
 */
Point.prototype.isClosed = function() {
    return this.closed;
};

/**
 * [TileMap 定义地图类]
 * @param {[int]} row    [地图拥有的行数]
 * @param {[int]} column [地图拥有的列数]
 */
var TileMap = function(row, column) {
    //记录地图数据二维数组
    this._data = [];
    //待扩展节点队列
    this._opened = [];
    this.row = row;
    this.column = column;
    //初始化地图数据
    for (var i = 0; i < row; i++) {
        this._data[i] = [];
        for (var j = 0; j < column; j++) {
            this._data[i][j] = new Point(i, j);
        }
    }
    return this;
};
/**
 * [setBlocks 设置障碍物]
 * @param {[array]} blocks [障碍物位置]
 */
TileMap.prototype.setBlocks = function(blocks) {
    blocks.forEach(function(block) {
        var row = Math.floor(block / this.column);
        var column = block % this.column;
        this._data[row][column].setState(1);
    }.bind(this));
    return this;
};
/**
 * [getPoint 获取地图的某个格点]
 * @param  {[int]} row    [行]
 * @param  {[int]} column [列]
 * @return {[Point]}        [返回点实例]
 */
TileMap.prototype.getPoint = function(row, column) {
    return this._data[row][column];
};
/**
 * [startAt 设置开始位置]
 * @param  {[int]} row    [开始行]
 * @param  {[int]} column [开始列]
 * @return {[type]}        [description]
 */
TileMap.prototype.startAt = function(row, column) {
    this.startRow = row;
    this.startColumn = column;
    return this;
};
/**
 * [endAt 设置结束位置]
 * @param  {[int]} row    [结束行]
 * @param  {[int]} column [结束列]
 * @return {[type]}        [description]
 */
TileMap.prototype.endAt = function(row, column) {
    this.endRow = row;
    this.endColumn = column;
    return this;
};
/**
 * [evaluateW 计算地图两点之间的预估距离]
 * @param  {[Point]} startPoint [起点]
 * @param  {[Point]} endPoint   [终点]
 * @return {[int]}            [返回欧几里得距离]
 */
TileMap.prototype.evaluateW = function(startPoint, endPoint) {
    return Math.sqrt(Math.pow(endPoint.row - startPoint.row, 2) + Math.pow(endPoint.column - startPoint.column, 2));
};
/**
 * [getOpenedPoints 获取某个节点的子节点]
 * @param  {[Point]} point [将要扩展的节点]
 * @return {[array]}       [子节点数组]
 */
TileMap.prototype.getOpenedPoints = function(point) {
    var points = [];
    var row = point.row,
        column = point.column,
        parent = point.getParent();
    //上边的点
    if (row) {
        var up = this._data[row - 1][column];
        var leftup = this._data[row - 1][column - 1];
        var rightup = this._data[row - 1][column + 1];
        if (!up.getState() && up !== parent) {
            points.push({
                point: up,
                d: 1
            });
        }
        if (leftup && !leftup.getState() && leftup !== parent) {
            points.push({
                point: leftup,
                d: Math.sqrt(2)
            });
        }
        if (rightup && !rightup.getState() && rightup !== parent) {
            points.push({
                point: rightup,
                d: Math.sqrt(2)
            });
        }
    }
    //右边的点
    if (column + 1 < this.column) {
        var right = this._data[row][column + 1];
        if (!right.getState() && right !== parent) {
            points.push({
                point: right,
                d: 1
            });
        }
    }
    //下边的点
    if (row + 1 < this.row) {
        var down = this._data[row + 1][column];
        var leftdown = this._data[row + 1][column - 1];
        var rightdown = this._data[row + 1][column + 1];
        if (!down.getState() && down !== parent) {
            points.push({
                point: down,
                d: 1
            });
        }
        if (leftdown && !leftdown.getState() && leftdown !== parent) {
            points.push({
                point: leftdown,
                d: Math.sqrt(2)
            });
        }
        if (rightdown && !rightdown.getState() && rightdown !== parent) {
            points.push({
                point: rightdown,
                d: Math.sqrt(2)
            });
        }
    }
    //左边的点
    if (column) {
        var left = this._data[row][column - 1];
        if (!left.getState() && left !== parent) {
            points.push({
                point: left,
                d: 1
            });
        }
    }
    return points;
};
/**
 * [resolve 搜索起点到终点的最短路线]
 * @return {[array]} [位置序列]
 */
TileMap.prototype.resolve = function() {
    //起点终点
    var startPoint = this._data[this.startRow][this.startColumn];
    var endPoint = this._data[this.endRow][this.endColumn];
    startPoint.setD(0);
    startPoint.setW(this.evaluateW(startPoint, endPoint));
    //先把起点放进队列
    this._opened.push(startPoint);
    //当有节点需要被扩展时
    while (this._opened.length) {
        //广度优先遍历，所以先进先出
        var point = this._opened.shift();
        //如果是终点，则停止搜索，并记录搜索路线
        if (point === endPoint) {
            this.sequence = [];
            this.shortestDis = point.getD();
            //逆向追寻路线，把节点标记为2，代表路线
            while (point) {
                this.sequence.splice(0, 0, point.row * this.column + point.column);
                point.setState(2);
                point = point.getParent();
            }
            break;
        } else {
            //如果不是终点，则扩展当前节点，得出可以走的，不是上一级的节点的节点。
            var res = this.getOpenedPoints(point);
            //如果可以扩展，则计算子节点的预估距离f
            res.forEach(function(info) {
                var p = info.point;
                var d = point.getD() + info.d;
                var w = this.evaluateW(p, endPoint);
                //如果第一次被扩展，则放进队列，并记录子节点的父节点
                if (!p.isExtended()) {
                    p.setD(d);
                    p.setW(w);
                    p.setParent(point);
                    this._opened.push(p);
                } else {
                    //如果之前已经被扩展过，而且这次的距离比上次扩展的距离要短，则需要修改父节点的指针
                    if (p.d > d) {
                        //如果已经在队列中，说明还未被扩展，修改父节点的指针即可
                        p.setD(d);
                        p.setW(w);
                        p.setParent(point);
                        //如果已经扩展过了，则如果p的后继节点的最短权重重新计算，如果通过p到达后继节点更近，则修改后继节点的父节点指针
                        if (p.isClosed()) {
                            var temp = this.getOpenedPoints(p);
                            temp.forEach(function(child) {
                                var childP = child.point;
                                var childD = p.getD() + child.d;
                                if (childP.d > childD) {
                                    childP.setD(childD);
                                    childP.setParent(p);
                                }
                            });
                        }
                    }
                }

            }.bind(this));
            point.close();
            //按照f排序，向接近目标的节点前进
            this._opened.sort(function(a, b) {
                return a.getF() - b.getF();
            });
        }
    }
    //返回搜索路线
    return this.sequence;
};
/**
 * [reset 重置地图]
 * @return {[undefined]} [无]
 */
TileMap.prototype.reset = function() {
    //重置队列
    this._opened = [];
    //重置结果路线
    this.sequence = null;
    //重置起点终点
    this.startRow = this.startColumn = this.endRow = this.endColumn = 0;
    this.shortestDis = 0;
    //重置地图每个格点的状态
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
/**
 * [toString 输出地图的数据]
 * @return {[string]} [返回输出字符串]
 */
TileMap.prototype.toString = function() {
    return this._data.map(function(rowData) {
        return rowData.map(function(p) {
            return p.getState();
        });
    }).join('\n');
};