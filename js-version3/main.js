(function(TileMap) {
    //初始化地图大小
    var tilemap = new TileMap(10, 10),
        tilesize = Math.min(50, window.innerWidth / tilemap.column);
    //设置障碍物
    tilemap.setBlocks([13, 17, 23, 31, 32, 33, 35, 36, 45, 46, 52, 53, 60, 61, 62, 63, 66, 67, 68, 69, 73, 76, 83, 84, 86, 93]);
    //设置地图dom长宽
    var map = $('#map').width(tilemap.row * tilesize).height(tilemap.column * tilesize);
    console.log(tilemap.toString());
    //添加行和列dom
    for (var i = 0, n = tilemap.row; i < n; i++) {
        for (var j = 0, m = tilemap.column; j < m; j++) {
            var p = tilemap.getPoint(i, j);
            var tile = $('<div></div>').addClass('tile state' + p.getState()).attr({
                row: i,
                column: j
            }).css({
                lineHeight: tilesize + 'px',
                width: tilesize,
                height: tilesize
            }).appendTo(map);
        }
    }
    //记录当前起点
    var currentRow = 1,
        currentColumn = 1;
    //设置双击事件，当双击某个格点时，相当于要到达这个终点
    $('#map').on('dblclick touchend', '.tile', function(e) {
        var self = $(this);
        //如果不是点击障碍物
        if (!self.is('.state1')) {
            var targetRow = self.attr('row'),
                targetColumn = self.attr('column');
            //重置地图
            tilemap.reset();
            //也重置页面的上一条路线
            map.find('.tile').text('').removeClass('state2');
            //设置起点
            tilemap.startAt(currentRow, currentColumn);
            map.find('.tile[row="' + currentRow + '"][column="' + currentColumn + '"]').text('始');
            //设置终点
            tilemap.endAt(targetRow, targetColumn);
            map.find('.tile[row="' + targetRow + '"][column="' + targetColumn + '"]').text('终');
            //获取路线
            var sequence = tilemap.resolve();
            if (sequence) {
                //如果能够到达终点，则把终点当做下一次的起点
                currentRow = targetRow;
                currentColumn = targetColumn;
                console.log(tilemap.toString());
                console.log('shortestDis: ' + tilemap.shortestDis);
                //遍历路线并渲染页面
                sequence.forEach(function(index, i) {
                    setTimeout(function() {
                        map.find('.tile').eq(index).removeClass('state0 state1').addClass('state2');
                    }, i * 200);
                });
            } else {
                alert('走投无路');
            }
        }
    });
    //默认一开始双击了第9行第9列的终点
    $('#map').find('.tile').eq(88).dblclick();
})(TileMap);