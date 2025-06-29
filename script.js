$(document).ready(function() {
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    });

    $('.faq-pergunta').on('click', function() {
        const item = $(this).closest('.faq-item');
        item.toggleClass('active');
        $('.faq-item').not(item).removeClass('active');
    });
});
