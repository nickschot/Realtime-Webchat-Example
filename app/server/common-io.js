'use strict';

module.exports.send_response = function(nsp, channel, data, error) {
    nsp.emit(channel, {data: data, error: error});
};

module.exports.send_rooms_to = function(nsp, room_manager) {
    module.exports.send_response(nsp, 'receive_rooms', room_manager.get_all_rooms(), false);
};
