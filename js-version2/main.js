(function(TileMap) {
    var tilemap = new TileMap(10, 10),
        tilesize = 50;
    tilemap.setBlocks([13, 17, 23, 31, 32, 33, 35, 36, 45, 46, 52, 53, 60, 61, 62, 63, 66, 67, 68, 69, 76, 83, 84, 86]);
    var map = $('#map').width(tilemap.row * tilesize).height(tilemap.column * tilesize);
    console.log(tilemap.toString());
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
    var currentRow = 1,
        currentColumn = 1;
    $('#map').on('dblclick', '.tile', function(e) {
        var self = $(this);
        if (!self.is('.state1')) {
            var targetRow = self.attr('row'),
                targetColumn = self.attr('column');
            tilemap.reset();
            map.find('.tile').text('').removeClass('state2');
            tilemap.startAt(currentRow, currentColumn);
            map.find('.tile[row="' + currentRow + '"][column="' + currentColumn + '"]').text('始');
            tilemap.endAt(targetRow, targetColumn);
            map.find('.tile[row="' + targetRow + '"][column="' + targetColumn + '"]').text('终');
            var sequence = tilemap.resolve();
            if (sequence) {
                currentRow = targetRow;
                currentColumn = targetColumn;
                console.log(tilemap.toString());
                console.log('shortestDis: ' + tilemap.shortestDis);
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
    $('#map').find('.tile').eq(87).dblclick();
})(TileMap);