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
Point.prototype.isExtended = function() {
    return !!this.f;
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
 * @return {[int]}            [返回曼哈顿距离]
 */
TileMap.prototype.evaluateW = function(startPoint, endPoint) {
    return Math.abs(endPoint.row - startPoint.row) + Math.abs(endPoint.column - startPoint.column);
};
/**
 * [getOpenedPoints 获取某个节点的子节点]
 * 说明：为什么弃掉扩展过的节点呢？因为是广度优先的，所以后边生成的节点深度肯定大于等于之前生成的节点，第二次生成的d一定>=第一次生成的d，同时w是不变的，所以第二次生成的f也一定>=第一次生成的f，所以没必要再次放进队列。所以弃掉。
 * @param  {[Point]} point [将要扩展的节点]
 * @return {[array]}       [子节点数组]
 */
TileMap.prototype.getOpenedPoints = function(point) {
    var points = [];
    var row = point.row,
        column = point.column;
    //上边的点
    if (row) {
        var up = this._data[row - 1][column];
        if (!up.getState() && !up.isExtended() && up !== point.getParent()) {
            points.push(up);
        }
    }
    //右边的点
    if (column + 1 < this.column) {
        var right = this._data[row][column + 1];
        if (!right.getState() && !right.isExtended() && right !== point.getParent()) {
            points.push(right);
        }
    }
    //下边的点
    if (row + 1 < this.row) {
        var down = this._data[row + 1][column];
        if (!down.getState() && !down.isExtended() && down !== point.getParent()) {
            points.push(down);
        }
    }
    //左边的点
    if (column) {
        var left = this._data[row][column - 1];
        if (!left.getState() && !left.isExtended() && left !== point.getParent()) {
            points.push(left);
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
            //如果不是终点，则扩展当前节点，得出可以走的，不是上一级的节点，还未扩展过的节点。
            var points = this.getOpenedPoints(point);
            //如果可以扩展，则计算子节点的预估距离f
            points.forEach(function(p) {
                //放进队列，并记录子节点的父节点
                var d = point.getD() + 1;
                var w = this.evaluateW(p, endPoint);
                p.setD(d);
                p.setW(w);
                p.setParent(point);
                this._opened.push(p);
            }.bind(this));
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