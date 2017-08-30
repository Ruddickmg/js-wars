import notifications, {PubSub} from "../../../tools/pubSub";

export default function() {

    const {}: PubSub = notifications();

    // TODO
    // ----------- decouple ------------ //
    // Teams.playerElement(playerNumber)
    //     .co()
    //     .changeCurrent(player.co);
    // });

    // if (indexOfRemovedPlayer < playerNumber) {
    //
    //     Teams.arrows.setPosition(Teams.playerElement(app.user.number()).co());
    // }

    // TODO decouple - changePropertyOnPlayer
    // const changeProperty = (property) => { // change this its weird
    //
    //     var player = players[indexOfPlayer(position.player)];
    //     var property = position.property;
    //     var value = position.valueOfCurrentElement;
    //     var element = Teams.playerElement(playerController.number(player));
    //
    //     if (element && element[property]) {
    //
    //         element[property]().changeCurrent(value);
    //     }
    //
    //     playerController.setProperty(player, property, value);
    // }

    // TODO - playerAdded
    // var element = Teams.playerElement(player.number);
    //
    // if (element) {
    //
    //     player.co = element.coName();
    // }

    let elements = [];

    const setElements = function(newElements: any): void {

        elements = newElements;

        return this;
    };

    const addElement = function(e) {

        elements.push(e);

        return this;
    };

    const getElement = (elementNumber) => elements[elementNumber - 1];

    return {

        setElements,
        addElement,
        getElement,
    };
}
