//生成地图
function generateMap() {
	//二维数组
	var map = [];
	for (var i = 0, n = 10; i < n; i++) {
		map[i] = [];
		for (var j = 0, m = 10; j < m; j++) {
			//block：0 代表没有障碍物
			//d：0 代表离起点的实际距离
			//w：0 代表离终点的预估距离
			//f：0 代表起点经过该店到达终点的预估距离，0代表还未被扩展，不为0则已经扩展过了
			map[i][j] = {
				x: j,
				y: i,
				block: 0,
				d: 0,
				w: 0,
				f: 0
			};
			//设置障碍物
			if (~[13, 17, 23, 31, 32, 33, 35, 36, 45, 46, 52, 53, 60, 61, 62, 63, 66, 67, 68, 69, 76, 83, 84, 86].indexOf(i * 10 + j)) {
				map[i][j].block = 1;
			}
		}
	}
	return map;
}
//获取节点的邻接节点，按照下上右左顺序获取
function getOpenedPoints(map, point) {
	var points = [];
	var x = point.x,
		y = point.y;
	if (y + 1 < 10 && !map[y + 1][x].block) {
		points.push(map[y + 1][x]);
	}
	if (y - 1 >= 0 && !map[y - 1][x].block) {
		points.push(map[y - 1][x]);
	}
	if (x + 1 < 10 && !map[y][x + 1].block) {
		points.push(map[y][x + 1]);
	}
	if (x - 1 >= 0 && !map[y][x - 1].block) {
		points.push(map[y][x - 1]);
	}
	return points;
}
//计算两点之间的预估距离
function evaluateW(point, endPoint) {
	return Math.abs(endPoint.x - point.x) + Math.abs(endPoint.y - point.y);
}
//生成地图
var map = generateMap();
for (var i = 0; i < 10; i++) {
	console.log(map[i].map(function(obj) {
		return obj.block;
	}) + '\n');
}
//等待遍历的队列
var opened = [],
	//起点，终点坐标
	startX = 1,
	startY = 1,
	endX = 8,
	endY = 8;
//起点，终点
var startPoint = map[startY][startX];
var endPoint = map[endY][endX];
//先把起点放进去队列
startPoint.d = 0;
startPoint.w = evaluateW(startPoint, endPoint);
startPoint.f = startPoint.d + startPoint.w;
opened.push(startPoint);
//还未找到终点
var resolved = false;
//有节点需要扩展的话
while (opened.length) {
	//广度优先遍历，所以先进先出
	var point = opened.shift();
	//如果是终点，则停止搜索，并记录搜索路线
	if (point.x === endPoint.x && point.y === endPoint.y) {
		//标记已经找到终点
		resolved = true;
		//记录最短距离
		shortestDis = point.d;
		//逆向追寻路线，把节点标记为2，代表路线
		while (point) {
			point.block = 2;
			point = point.parent;
		}
		console.log('\n\n');
		for (var i = 0; i < 10; i++) {
			console.log(map[i].map(function(obj) {
				return obj.block;
			}) + '\n');
		}
		console.log('shortestDis: ' + shortestDis);
		break;
	}
	//如果不是终点，则扩展当前节点，得出可以走的，不是上一级的节点，还未扩展过的节点。
	//说明：为什么弃掉扩展过的节点呢？因为是广度优先的，所以后边生成的节点深度肯定大于等于之前生成的节点，第二次生成的d一定>=第一次生成的d，同时w是不变的，所以第二次生成的f也一定>=第一次生成的f，所以没必要再次放进队列。所以弃掉。
	var points = getOpenedPoints(map, point).filter(function(p) {
		return p != point.parent && !p.f;
	});
	if (points.length) {
		//如果可以扩展，则计算子节点的预估距离f
		points.forEach(function(p) {
			//放进队列，并记录子节点的父节点
			var d = point.d + 1;
			var w = evaluateW(p, endPoint);
			var f = d + w;
			p.d = d;
			p.w = w;
			p.f = f;
			p.parent = point;
			opened.push(p);
		});
	}
	//按照f排序，向接近目标的节点前进
	opened.sort(function(a, b) {
		return a.f - b.f;
	});
}
//最后所有节点都扩展了，还不能到达终点，说明起点不能到达终点
if (!resolved) {
	console.log('no resolution');
}