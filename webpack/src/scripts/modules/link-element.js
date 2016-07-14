$('.link a.qr').on('click', function(event){
    event.preventDefault();

    var customModal = $('<div class="custom-modal modal"><div class="modal-dialog"></div></div>');

    $('body').append(customModal);

    $(this).find($('h3')).clone().appendTo('.custom-modal .modal-header');

    $(this).find('.device-product, .device-details').clone().appendTo('.custom-modal .modal-body');

    $('.custom-modal .hide').show();

    $('.custom-modal').modal();

    $('body').css('padding-right', '0px');

    $('.custom-modal').on('hidden.bs.modal', function(){
        $('.custom-modal').remove();
    });

    var element = $('.custom-modal .modal-dialog')[0],
        url = $(this).parents('.row').find('.url').attr('href');

    //new QRCode(element, url);

    $('.custom-modal .modal-dialog').css('width', '296px').css('padding', '20px').css('background', 'white');

    var qrcode = new QRCode(element, {
        text: url,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    qrcode.makeCode()
});


$('.link .others a.action.delete').on('click', function(event){
    event.preventDefault();

    var uuid = $(this).parents('.link').attr('uuid');

    $('#delete-modal').modal('show');

    $('#delete-modal .btn.confirm').off('click');

    $('#delete-modal .btn.confirm').on('click', function(){
        window.location = '/link/delete?uuid=' + uuid;
    });
});