"use strict";

function lobby(identity) {

	const
		id = identity,
		name = "lobby",
		players = {};

	let length = 0;

	return {

		id: () => id,
		name: () => name,
		size: () => length,
        all: () => players,
        getPlayer: (id) => players[id],
        add(player) {

			const id = player.id;

			if(!isNaN(id)) {

				length += 1;
				player.number = length;
				players[id] = player;
			}
		},
        removePlayer(id) {

            const removed = players[id];

            delete players[id];

            if (removed) {

                length -= 1;
            }

            return removed;
        }
	};
}

module.exports = lobby;