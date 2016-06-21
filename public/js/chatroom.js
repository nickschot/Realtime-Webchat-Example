'use strict';

/** COPIED FROM http://www.technicaloverload.com/get-value-url-parameters-using-javascript/ */
function getParameter(theParameter) {
  var params = window.location.search.substr(1).split('&');

  for (var i = 0; i < params.length; i++) {
    var p=params[i].split('=');
	if (p[0] == theParameter) {
	  return decodeURIComponent(p[1]);
	}
  }
  return false;
}

$().ready(function(){
    var socket = io();
    var room_name = getParameter('room-name');

    $(window).on('beforeunload', function() {
        socket.emit('disconnect-from-app');
    });

    socket.emit('join_room', room_name);

    $('#chatbox_form').on('submit', function(e){
        e.preventDefault();

        var messageText = $('#chatbox_message').val();

        if(messageText){
            var message = {
                message: messageText
            };

            socket.emit('chatbox_message', message);
            $('#chatbox_message').val('');
        }
    });

    socket.on('chatbox_message', function(msg){
        appendMessage('user', msg);
    });

    socket.on('system_message', function(msg){
        appendMessage('system', msg);
    });

    function appendMessage(type, msg){
        var messageClass = '';
        var messageElem = '';

        if(type === 'system'){
            messageClass = 'system';

            messageElem = $('<li class="' + messageClass + '"><p><i></i></p></li>');
            messageElem.find('i').text(msg.message);
        } else {
            messageClass = msg.username === username ? 'user' : '';

            if(lastMessageFromUser(msg.username)){
                if(msg.username === username){
                    $('#chatbox_messages li:last-child').addClass('previous-message');
                } else {
                    messageClass += ' consecutive-message';
                }

                messageClass += ' username-hidden';
            }

            messageElem = $('<li class="' + messageClass + '"><span></span><p></p></li>');
            messageElem.children('span').text(msg.username);
            messageElem.children('p').text(msg.message);
        }

        messageElem
            .css('opacity', 0)
            .appendTo('#chatbox_messages')
            .animate({ opacity: 1 }, 300)
            .css('transform', 'translateY(0)');
        scrollDown();
    }

    function lastMessageFromUser(username){
        var lastUsername = $('#chatbox_messages li:last-child').find('span').text();
        return lastUsername === username;
    }

    function scrollDown(){
        var height = $('html').outerHeight();
        var windowHeight = $(window).height();

        var scrollStart = $('html').scrollTop();
        var scrollEnd = height > windowHeight ? height - windowHeight : scrollStart;

        //TODO: don't scroll when a user is scrolled up
        $('body').animate({
            scrollTop: scrollEnd+'px'
        }, 300);
    }
});
