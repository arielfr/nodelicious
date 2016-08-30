$('.navbar a.search').on('click', function(){
    $('.searcher').show();
});

$('.searcher button.cancel').on('click', function(){
    $('.searcher').hide();
});

$('.searcher form').on('submit', function(){
    var text = $(this).find('input[name=text]').val();

    if( !text || text == '' ){
        event.preventDefault();
    }
});