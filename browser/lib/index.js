require('./gitscrum');

var $ = require('ender')
  ;

function attachHandlers() {
  var dragSrcEl_ = null;

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', $(this).html());

    dragSrcEl_ = this;

    // this/e.target is the source node.
    $(this).addClass('moving');
    var self = this;
    setTimeout(function () {
      //$(self).addClass('moving');
      //$(self).addClass('xmoving');
    }, 412);
    //$(this).appendTo('#graveyard');
  };

  function handleDragOver(e) {
    // e.offset === undefined
    console.log('dragover', $(this).offset(), $(dragSrcEl_).offset(), $(e).offset(), e);
    if (e.preventDefault) {
      e.preventDefault(); // Allows us to drop.
    }
  
    e.dataTransfer.dropEffect = 'move';

    return false;
  };

  function handleDragEnter(e) {
    console.log('dragenter');
    $(this).addClass('over');
  };

  function handleDragLeave(e) {
    console.log('dragleave');
    // this/e.target is previous target element.
    $(this).removeClass('over');
  };

  function handleDrop(e) {
    console.log('drop');
    e.stopPropagation(); // stops the browser from redirecting.

    // Don't do anything if we're dropping on the same js-issue we're dragging.
    if (dragSrcEl_ === this) {
      return false;
    }

    $(dragSrcEl_).remove();
    $(this).after(dragSrcEl_);
    $(this).removeClass('moving');
    $(this).removeClass('xmoving');

    setTimeout(function () {
      $('.js-issue').removeClass('xmoving');
      $('.js-issue').removeClass('moving');
    }, 200);
    return false;

    //$(dragSrcEl_).html($(this).html());
    //$(this).html(e.dataTransfer.getData('text/html'));

    // Set number of times the js-issue has been moved.
    var count = $(this).find('.count');
    var newCount = parseInt(count.attr('data-col-moves')) + 1;
    count.attr('data-col-moves', newCount);
    count.text('moves: ' + newCount);

    return false;
  };

  function handleDragEnd(e) {
    console.log('dragend');
    $('.js-issue').removeClass('over');
    $('.js-issue').removeClass('moving');
    $('.js-issue').removeClass('xmoving');
    console.log('dragend');
  };

  /*
  var body = document.body.innerHTML;
  document.body.innerHTML = '';
  setTimeout(function () {
    document.body.innerHTML = body;
  }, 1 * 1000);
  */

  $('body').delegate('.js-issue', 'dragstart', handleDragStart);
  $('body').delegate('.js-issue', 'dragend', handleDragEnd);
  $('body').delegate('.js-issue', 'dragenter', handleDragEnter);
  $('body').delegate('.js-issue', 'dragleave', handleDragLeave);
  $('body').delegate('.js-issue', 'dragover', handleDragOver);
  $('body').delegate('.js-issue', 'drop', handleDrop);
};
$.domReady(attachHandlers);
