function generateMap() {
	var map = [];
	for (var i = 0, n = 10; i < n; i++) {
		map[i] = [];
		for (var j = 0, m = 10; j < m; j++) {
			map[i][j] = {
				x: j,
				y: i,
				block: 0,
				closed: false,
				d: 0,
				w: 0,
				f: 0
			};
			if (~[13, 17, 23, 31, 32, 33, 35, 36, 45, 46, 52, 53, 60, 61, 62, 63, 66, 67, 68, 69, 76, 83, 84, 86].indexOf(i * 10 + j)) {
				map[i][j].block = 1;
			}
		}
	}
	return map;
}

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

function evaluateW(point, endPoint) {
	return Math.abs(endPoint.x - point.x) + Math.abs(endPoint.y - point.y);
}
var map = generateMap();
for (var i = 0; i < 10; i++) {
	console.log(map[i].map(function(obj) {
		return obj.block;
	}) + '\n');
}
var opened = [],
	// closed = [],
	startX = 1,
	startY = 1,
	endX = 8,
	endY = 8;
var startPoint = map[startY][startX];
var endPoint = map[endY][endX];
startPoint.d = 0;
startPoint.w = evaluateW(startPoint, endPoint);
startPoint.f = startPoint.d + startPoint.w;
opened.push(startPoint);
// openedPoints = getOpenedPoints(map, startPoint);
// opened.push(openedPoints);
var resolved = false;
while (opened.length) {
	var point = opened.shift();
	// closed.push(point);
	if (point.x === endPoint.x && point.y === endPoint.y) {
		resolved = true;
		shortestDis = point.d;
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
	var points = getOpenedPoints(map, point).filter(function(p) {
		return p != point.parent && !p.closed;
	});
	if (points.length) {
		points.forEach(function(p) {
			var d = point.d + 1;
			var w = evaluateW(p, endPoint);
			var f = d + w;
			if (!p.f) {
				p.d = d;
				p.w = w;
				p.f = f;
				p.parent = point;
				opened.push(p);
			} else {
				if (p.d > d) {
					p.d = d;
					p.w = w;
					p.f = f;
					p.parent = point;
				}
			}
		});
	}
	point.closed = true;
	opened.sort(function(a, b) {
		return a.f - b.f;
	});
}
if (!resolved) {
	console.log('no resolution');
}