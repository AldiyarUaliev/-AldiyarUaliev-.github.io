const scripts = document.getElementsByTagName('script');
const path = scripts[scripts.length - 1].src.split('?')[0];
const currentPath = path.split('/').slice(0, -1).join('/') + '/';

$(document).ready(function ($) {
    loadPopUpContainer();

	$('#history .history_btn').click(function(event) {
		$(this).toggleClass('left');
	});
	$('.hamburger').click(function(event) {
		$(this).toggleClass('is-active');
		$('#menu').toggleClass('active');
		$('.bg_menu').toggleClass('active');
    });

    $(document).on('click', '#show-pop-up-form', function() {
        loadForm();
        prepareFields();
    });

    
    $('.popup-with-zoom-anim').magnificPopup({
        type: 'inline',
        fixedContentPos: true,
        fixedBgPos: true,

        overflowY: 'auto',

        closeBtnInside: true,
        preloader: false,
        
        midClick: true,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in'
    });

	$("#phone").mask("+7 (999) 999-99-99");
    $(document).on('click', '.mfp-close, .mfp-close img', function(event) {
        $.magnificPopup.close();
    });

    $(".datepicker").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '1950:2018',
        dateFormat: 'dd.mm.yy',
    });

    $(document).on('submit', '#work-store-form', function (event) {
        event.preventDefault();
        submitForm($(this).closest('form').attr('id'));
    });

    $(document).on('click', '.history_btn span', function() {
        $(this).parent().find('span').removeClass('active');
        $(this).addClass('active');
        $('#work-store-form').find('input#type').val($(this).text());
        printPosition();
        changeForm(this);
    });

    $(document).on('change','#post',function() {
        setHrEmail($(this).val());
    });

});

function changeForm(element) {
    const type = $(element).data('type');
    $('#city').parent().show();
    $('#store').parent().show();

    if (type === 'office') {
        $('#city').parent().hide();
        $('#city option[data-id="1"]').attr('selected', 'selected');
        $('#store').parent().hide();
        
    }
    else if (type === 'students') {
        $('#store').parent().hide();
        
    }

    printStores();
    printPosition();
}

function loadPopUpContainer() {
    const formData = $(`<div id="form-pop-up" class="zoom-anim-dialog popup-work info-popup mfp-hide">
        <div class="mfp-close"><img src="img/popup-close.png" alt=""></div>
        <div id="pop-up-content"></div></div>`);
    formData.find('#pop-up-content').load(currentPath + '../form.html');
    const successBlock = `<div id="thank" class="zoom-anim-dialog thank info-popup mfp-hide">
    <div class="mfp-close"><img src="img/popup-close.png" alt=""></div>
    <img class="thank-img" src="img/thank.png" alt="">
    <b>Спасибо!</b>
    <p>
        Ваша анкета успешно отправлена и будет рассмотрена в ближайшее время. После принятия решения с Вами свяжется наш специалист.
    </p>
</div>`;

    const body = $('body');
    body.append(formData);
    body.append(successBlock);
}

function loadForm() {
    $.magnificPopup.open({
        items: {
            src: '#form-pop-up',
            type: 'inline',
            fixedContentPos: true,
            fixedBgPos: true,

            overflowY: 'auto',

            closeBtnInside: true,
            preloader: false,

            midClick: true,
            removalDelay: 300,
            mainClass: 'my-mfp-zoom-in'
        }
    });

    const body = $('body');
    const form = $('#form-pop-up');

    if (body.attr('id') === 'office_store_body') {
        form.find('.history_btn span').removeClass('active');
        form.find('.history_btn span[data-type="office"]').addClass('active');
        $('#work-store-form').find('input#type').val(form.find('.history_btn span[data-type="office"]').text());
    } else if (body.attr('id') === 'students_body') {
        form.find('.history_btn span').removeClass('active');
        form.find('.history_btn span[data-type="students"]').addClass('active');
        $('#work-store-form').find('input#type').val(form.find('.history_btn span[data-type="students"]').text());
    } else {
        form.find('.history_btn span').removeClass('active');
        form.find('.history_btn span[data-type="store"]').addClass('active');
        $('#work-store-form').find('input#type').val(form.find('.history_btn span[data-type="store"]').text());
    }
}

function prepareFields() {
    $.ajax({
        url: currentPath + '../data/data.json',
        dataType: 'json',
        success: function (data) {
            printCities(data);
        },
        error: function(error, xhr, message) {
            console.log(error, xhr, message);
            return false;
        }
    });
}

var data;
function printCities(array) {
    $('#city').html('<option value="" disabled selected>Выбрать</option>');

    array.forEach(function(item) {
        const option = `<option value='${item.cityName}' data-id='${item.cityId}'>${item.cityName}</option>`;
        $('#city').append(option);
    });

    data = array;
    
    $('#city').change(function () {
        printStores();
        printPosition();
    });
}

function printStores() {
    if (!data) {
        return false;
    }

    $('#store').html('<option value="" disabled selected>Выбрать</option>');
    const item = getChosenCityData();

    item.shops.forEach(function(shop) {
        const option = `<option value='${shop.shopAddress}' data-id='${shop.shopId}'>${shop.shopAddress}</option>`;
        $('#store').append(option);
    });

}

function getChosenCityData() {
    const chosenCity = $('#city option:selected').val();
    const chosenCityId = $('#city option:selected').data('id');
    let itemObj = null;

    data.forEach(function(item) {
        if (chosenCityId && item.cityId === chosenCityId || chosenCity === item.cityName) {
            itemObj = item;
        }
    });

    return itemObj;
}

function printPosition() {
    if (!data) {
        return false;
    }

    const chosenType = $('.history_btn span.active').data('type');
    $('#post').html('<option value="" disabled selected>Выбрать</option>');

    const item = getChosenCityData();

    if (item) {
        item.positions.forEach(function(positions) {
            if (positions.type === chosenType) {
                positions.position.forEach(function(position) {
                    const option = `<option value='${position}'>${position}</option>`;
                    $('#post').append(option);
                });
            }
        });
    }
}

function setHrEmail(post) {
    const chosenType = $('.history_btn span.active').data('type');
    const chosenPosition = post.toLowerCase();
    const item = getChosenCityData();

    item.positions.forEach(function (positions) {
        if (positions.type === chosenType) {
            if (chosenPosition === "практика") {
                $('#hr-email').val(positions['hr-practice-email']);
            } else {
                $('#hr-email').val(positions['hr-email'].join(";"));
            }
        }
    });
}

function submitForm(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const url = $(form).attr('action');

    if (!validateForm(form)) {
        $(document).on('keyup change focusout', '[name]', function () {
            validateForm(form);
        });

        return false;
    }

    if (!$('#checkbox').prop('checked')) {
        $('#rules').show();

        return false;
    }

    $('#rules').hide();
    $('.input-submit button').prop('disabled', 'true');

    $.ajax({
        url: url,
        data: formData,
        dataType: 'json',
        type: 'post',
        cache: false,
        crossDomain: true,
        contentType: false,
        processData: false,
        success: function(result) {
            if (result.success) {
                $.magnificPopup.open({
                    items: {
                        src: '#thank',
                        type: 'inline'
                    }
                });

                form.reset();
            } else {
                $.magnificPopup.open({
                    items: {
                        src: `<div id="error" class="zoom-anim-dialog thank info-popup">
		<div class="mfp-close" onclick="$.magnificPopup.close();"><img src="img/popup-close.png" alt=""></div>
		<b>При отправке сообщения произошла ошибка.</b>
		<p>
			${result.message}
		</p>
	</div>`,
                        type: 'inline'
                    }
                });
            }

            $('.input-submit button').removeAttr("disabled");
        },
        error: function(error, text, xnr) {
            console.log(error, text, xnr);
        }
    });
}

function validateForm(form) {
    const formElement = $(form);
    const formFields = formElement.find('input[name]');
    const phonePattern = /^[0-9]{10,11}/;
    const emailPattern = /^[a-z0-9][-a-z0-9.!#$%&'*+-=?^_`{|}~\/]+@([-a-z0-9]+\.)+[a-z]{2,5}$/;

    formFields.each(function () {
        if ($(this).val()) {
            if ($(this).attr('id') === 'phone' && !$(this).val().match(phonePattern)) {
                $(this).addClass('error-input');
            }
            else if ($(this).attr('id') === 'email' && !$(this).val().match(emailPattern)) {
                $(this).addClass('error-input');
            }

            $(this).removeClass('error-input');
            $(this).next('.error-input-span').hide();
        }
        else if($(this).attr('type') !== 'hidden'){
            $(this).addClass('error-input');
        }
    });

    $('#no-file').hide();
    const errors = $('.error-input');

    if (errors.length === 0) {
        return true;
    }

    errors.each(function () {
        if ($(this).attr('id') === 'no-file') {
            $('#no-file').show();
        } else {
            $(this).next('.error-input-span').show();
        }
    });

    return false;
}


