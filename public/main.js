/* global $, console */
/*
a.replace(/Copyright.+20.{2}/, "Copyright © 2010-2014")

$('.description').each(function() {
    $self = $(this);
    text = $self.val();
    $self.val(text.replace(/Copyright.+20.{2}/, "Copyright © 2010-2014"));
    $self.closest('.wrapper').addClass('updated');
});


*/

'use strict';

var findShopSections = function() {
    $.ajax({
        url: 'findShopSections',
        success: function(results) {
            var $shopSections = $('.shop-sections'),
                sections,
                html;

            if (results.statusCode === 200) {
                sections = results.sections;
                html = '';
                if (sections) {
                    sections.forEach(function(i) {
                        html += '<li data-shop-section-id="' + i.shop_section_id + '"><a href="#">' + i.title + ' (' + i.active_listing_count + ')</a></li>';
                    });
                    $shopSections.html(html);
                }
            } else {
                $('#shop-sections').dropdown('toggle');
                alert('Error occurred. Please try again.');
            }
        }
    });
};

var showListingResults = function(data) {
    $('.spinner').hide();
    $('.listings').html(data);
};

var findAllShopSectionListings = function(shopSectionId) {
    $.ajax({
        url: 'findAllShopSectionListings',
        data: {
            shopSectionId: shopSectionId
        },
        success: function(data) {
            showListingResults(data);
            $('.shop-section-0').text($('.shop-sections [data-shop-section-id=' + shopSectionId + ']').text());
        }
    });
};

var findAllListings = function() {
    $.ajax({
        url: 'findAllListings',
        success: function(data) {
            showListingResults(data);
        }
    });
};

var update = function(e) {
    var $target = $(e.target),
        $self,
        listingId,
        arr = [],
        operation;

    if (!$target.closest('.update-color-chart').length && !$target.closest('.update-listing').length) {
        return;
    }
    if ($target.closest('.update-color-chart').length) {
        console.log('updating color chart');
        operation = updateColorChart;
    } else if ($target.closest('.update-listing').length) {
        console.log('update listing');
        operation = updateListing;
    }
    $('.wrapper').each(function() {
        $self = $(this);
        if ($self.hasClass('updated')) {
            listingId = $self.data('listing-id');
            arr.push(listingId);
            console.log('listing id: ' + listingId);
        }
    });
    if (arr.length) {
        toggleOverlay('show');
        populateOverlay(arr);
        operation(arr);
    }
};

var showPending = function() {
    $('.listings').empty();
    $('.spinner').show();
};

var clearUI = function() {
    $('.wrapper').removeClass('updated');
    $('.find-replace-wrapper, .update-price-wrapper').addClass('hide');
    $('.update-color-chart-wrapper, .update-listing').addClass('hide');
    $('.price-wrap, .title, .description').hide();
    $('.img').addClass('hide-not-first').find('img').removeClass('sel');
    $('.img-selected-id').empty();
};

var reset = function() {
    clearUI();
    $('.operation-select').val(0);
    $('.update-price-by').val(5);
    $('.update-price-select').val('increase');
};

var updateListing = function(arr) {
    var len = arr.length,
        counter = 0;

    var callUpdate = function() {
        var field = $('.operation-select').val().replace('op-', '');
        $.ajax({
            url: 'updateListing',
            data: {
                listingId: arr[counter],
                field: field,
                val: $('.wrapper[data-listing-id=' + arr[counter] + '] .' + field).val()
            },
            success: function(data) {
                console.log(data);
                if (data.statusCode === 200) {
                    $('.listings').find('[data-listing-id=' + data.listingId + ']').removeClass('updated');
                    $('.overlay').find('[data-listing-id=' + data.listingId + ']').remove();
                }
                if (counter < len) {
                    callUpdate();
                } else {
                    toggleOverlay('hide');
                }
            }
        });
        counter++;
    };
    callUpdate();
};

var updateColorChart = function(arr) {
    var len = arr.length,
        counter = 0,
        colorChartId = $('.color-chart-id').val();

    var callUpdate = function() {
        $.ajax({
            url: 'updateColorChart',
            data: {
                listingId: arr[counter],
                imageId: colorChartId,
                rank: $('.wrapper[data-listing-id=' + arr[counter] + '] .img').data('selected')
            },
            success: function(data) {
                console.log(data);
                if (data.statusCode === 200) {
                    $('.listings').find('[data-listing-id=' + data.listingId + ']').removeClass('updated');
                    $('.overlay').find('[data-listing-id=' + data.listingId + ']').remove();
                }
                if (counter < len) {
                    callUpdate();
                } else {
                    toggleOverlay('hide');
                }
            }
        });
        counter++;
    };
    callUpdate();
};

var populateOverlay = function(data) {
    var $overlay = $('.overlay'),
        html = '';
    data.forEach(function(i) {
        html += '<div class="olay-id" data-listing-id="' + i + '">' + i + '</div>';
    });
    $overlay.html(html);
};

var toggleOverlay = function(mode) {
    var $shade = $('.shade'),
        $overlay = $('.overlay');
    if (mode === 'show') {
        $shade.show();
        $overlay.show();
    } else {
        $shade.hide();
        $overlay.hide();
    }
    return $overlay;
};

var replaceDescription = function() {
    var text;
    var find = $('.find').val();
    var replace = $('.replace').val();
    var $self;
    $('.description').each(function() {
        $self = $(this);
        text = $self.val();
        if (text.indexOf(find) > -1) {
            $self.val(text.replace(find, replace));
            $self.closest('.wrapper').addClass('updated');
        }
    });
};

var changePrice = function() {
    var $select = $('.update-price-select'),
        operation = $select.val(),
        val = parseInt($('.update-price-by').val(), 10),
        $self;

    val = (operation === 'increase') ? val : -val;
    $('.wrapper .price').each(function() {
        $self = $(this);
        $self.val(+ $self.val() + val);
        $self.closest('.wrapper').addClass('updated');
    });
};

var guessAndSelectedColorChartRank = function() {
    var $wrappers = $('.wrapper');
    $wrappers.each(function() {
        $(this).find('.img img').eq(2).trigger('click');
    });
};

$('.shop-sections-wrapper').on('click', function() {
    var $this = $(this);
    if ($this.find('li').length < 1) {
        findShopSections();
    }
});
$('.shop-sections').on('click', function(e) {
    var $target = $(e.target),
        shopSectionId = $target.closest('li').data('shop-section-id');
    showPending();
    reset();
    findAllShopSectionListings(shopSectionId);
});
$('.get-all-listings').on('click', function() {
    showPending();
    reset();
    findAllListings();
});
$('.operation-select').on('change', function(e) {
    var val = $(e.target).val(),
        $find = $('.find-replace-wrapper'),
        $price = $('.update-price-wrapper'),
        $colorChart = $('.update-color-chart-wrapper'),
        $listing = $('.update-listing'),
        $priceWrap = $('.price-wrap'),
        $descriptionTextArea = $('.description'),
        $title = $('.title'),
        $img = $('.wrapper .img');

    clearUI();

    if (val === 'op-title') {
        $listing.removeClass('hide');
        $title.show();
    } else if (val === 'op-description') {
        $find.removeClass('hide');
        $listing.removeClass('hide');
        $descriptionTextArea.show();
    } else if (val === 'op-price') {
        $price.removeClass('hide');
        $listing.removeClass('hide');
        $priceWrap.show();
    } else if (val === 'op-image') {
        $colorChart.removeClass('hide');
        $img.removeClass('hide-not-first');
        guessAndSelectedColorChartRank();
    } else {
        reset();
    }
});

$('.go-replace').on('click', function() {
    replaceDescription();
});
$('.change-price').on('click', function() {
    changePrice();
});
$('.update-listing').on('click', function(e) {
    update(e);
});
$('.update-color-chart-wrapper').on('click', function(e) {
    update(e);
});
$('.listings').on('click', function(e) {
    var $target = $(e.target),
        $wrapper = $target.closest('.wrapper'),
        $imgClass = $wrapper.find('.img'),
        $imgs = $imgClass.find('img'),
        $img = $target.closest('img'),
        imgState;
    if ($target.closest('.checkbox').length) {
        if ($wrapper.hasClass('updated')) {
            $wrapper.removeClass('updated');
        } else {
            $wrapper.addClass('updated');
        }
    } else if ($img.length) {
        if ($('.operation-select').val() !== 'op-image') {
            return;
        }
        imgState = $img.hasClass('sel');
        $imgs.removeClass('sel');
        $wrapper.removeClass('updated');
        if (!imgState) {
            $img.addClass('sel');
            $imgClass.data('selected', 1 + $img.data('index'));
            $wrapper.addClass('updated');
            $wrapper.find('.img-selected-id').text($img.attr('title').match(/il.+_/)[0].replace('il_75x75.', '').replace('_', ''));
        } else {
            $imgClass.data('selected', '');
            $wrapper.find('.img-selected-id').text('');
        }
    }
});

