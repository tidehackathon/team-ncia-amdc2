var freeboardInstance;

function saveBoard() {
    var boardSer = freeboardInstance.serialize();
    var boardStr = JSON.stringify(boardSer);
    var id = window.location.hash.substr(1).split('?')[0];
    console.debug('saving board:' + id);
    $.post('/board', {
        name: id,
        board: boardStr
    }, function(res) {
        console.debug(res);
    });
}

var boardLoads = {}; ///sneaky dirty trick!!!!!!!!!!!!!

function loadBoard(id) {
    if (boardLoads[id] && ((new Date().getTime() - boardLoads[id]) < 2000)) {
        return;
    }   
    boardLoads[id] = new Date().getTime(); 
    console.debug('loading board:' + id); 
    $('#freeboardContent').appendTo('#'+id);
    $('#freeboardContent').show();
    $.get('/board?name=' + id, function(res) {
        if (res == 'noboard') {
            freeboardInstance.newDashboard();
        } else {
            freeboardInstance.loadDashboard(JSON.parse(res));
        }
        if (!helios.admin) {
            freeboardInstance.setEditing(false, false);
            $('#main-header').hide();
        }
    });
}