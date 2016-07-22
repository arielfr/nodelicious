require('./../stylesheets/libs/bootstrap-material-design.less');
require('./../stylesheets/app/index.less');
require('./modules/fixed-link');
require('./modules/link-element');

//Initializing material
$.material.init();

$('.filter-applied .f-tag').on('click', function(event){
    var input = $(this).prev('input');

    $(input).remove();

    var serializedData = $('.filter-applied form').serialize();

    console.log(serializedData)

    var action = $('.filter-applied form').attr('action');

    window.location = action + '?' + serializedData;
});