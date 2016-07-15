$('.link a.qr').on('click', function(event){
    event.preventDefault();

    var customModal = $('<div class="custom-modal modal"><div class="modal-dialog"></div></div>');

    $('body').append(customModal);

    $('.custom-modal').modal('show');

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

    qrcode.makeCode();
});


$('.link .others a.action.delete').on('click', function(event){
    event.preventDefault();

    var uuid = $(this).parents('.link').attr('uuid');

    var customModal = $('<div class="modal delete-modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h4 class="modal-title">Delete</h4></div><div class="modal-body"><p>Are you sure you want to delete this note?</p></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary confirm">Delete</button></div></div></div></div>');

    $('body').append(customModal);

    $('.delete-modal').modal('show');

    $('.delete-modal').on('hidden.bs.modal', function(){
        $('.delete-modal').remove();
    });

    $('.delete-modal .btn.confirm').on('click', function(){
        window.location = '/link/delete?uuid=' + uuid;
    });
});