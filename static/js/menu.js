function menu(container, menuItems, _onchange) {
    var self = this;

    let listparent = $(document.createElement('ul'));
    container.append(listparent);
    menuItems.forEach((mi) => {
        let listitem = $(document.createElement('li'));
        $(document.createElement('a'))
            .attr('href', '#' + mi.id)
            .html(mi.title)
            .appendTo(listitem);
        listparent.append(listitem);
        container.append($(document.createElement('div')).attr('id', mi.id).css('display', 'none').addClass('mainContainer'));
    });

    container.tabs({
        beforeActivate: function(event, ui) {
            window.location.hash = ui.newPanel.attr('id');
            //helios.filters = {};
            _onchange(ui.newPanel.attr('id'));
        }
    });
}