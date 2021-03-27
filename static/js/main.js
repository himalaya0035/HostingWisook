jQuery(function ($) {

    $('#overlay').click(function () {
        $('.page-wrapper').toggleClass('toggled');
    });
    if (
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        )
    ) {
        $('.sidebar-content').mCustomScrollbar({
            axis: 'y',
            autoHideScrollbar: true,
            scrollInertia: 300,
        });
        $('.sidebar-content').addClass('desktop');
    }
});

// finally done
