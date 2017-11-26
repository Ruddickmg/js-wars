/**
 * Created by moonmaster on 5/29/17.
 */
import {Game} from "../../src/game/game";
import createMap, {Map} from "../../src/game/map/map";
import settings, {Settings} from "../../src/settings/settings";
import requestMaker, {Request} from "../../src/browser/communication/requests/request";

export default function() {

  const request = requestMaker();
  const allSettings = settings();
  const types = allSettings.get("maps", "requests").toObject();
  const categories = allSettings.get("categories"); // TODO assure these are working
  const maps = [];
  const games = [];
  let change: boolean = false;
  let index;
  let type: string = "map";

  const byCategory = (category: string): Promise<any> => {

    if (category) {

      request.get(category, types[type].url)
        .then((response: any) => {

          // maps = types[type].items = response;
          // change = true;
        })
        .catch((error: Error) => {

          throw error;
        });
    }

    return this;
  };

  const getMaps = (games: Game[]) => games.map(({map}: Game) => map);
  const format = (map: any) => {

    if (map) {

      return map.map ? map : createMap(
        map.id,
        map.name,
        map.players,
        map.dimensions,
        map.terrain,
        map.buildings,
        map.units,
      );
    }

    return {};
  };

  const byIndex = function(ind) {

    index = ind;

    const m = sub(format(maps[ind]));

    return m.map ? m.map : m;
  };

  const indexById = (array: any[], id: any) => {

    return array.findIndex((element: any) => element.id === id);
  };

  const byId = function(array, id) {

    return array[indexById(array, id)];
  };

  const sub = function(map) {

    return maps.length ? map : [];
  };

  const edit = function(array, element, callback) {

    if (category === element.category || element.saved) {

      const index = indexById(array, element.id);

      callback(array, element, index);

      change = true;

      return element;
    }
    return false;
  };

  // const elementExists = function(id, element, parent) {
  //
  //     const exists = document.getElementById(id);
  //
  //     exists ? parent.replaceChild(element, exists) : parent.appendChild(element);
  // };
  //
  // const buildingElements = {
  //
  //     section: "buildingsDisplay",
  //     div: "numberOfBuildings",
  // };

  allSettings.add("maps", "server", {

    map: {
      url: "maps/type",
      items: [],
      elements: {
        section: "mapSelectScreen",
        div: "selectMapScreen",
        li: "mapSelectionIndex",
        type: "map",
      },
    },

    game: {
      url: "games/open",
      items: [],
      elements: {
        section: "gameSelectScreen",
        div: "selectGameScreen",
        li: "mapSelectionIndex",
        type: "game",
        index: "Index",
        attribute: "class",
        url: "games/open",
        properties: app.settings.categories,
      },
    },
  });

  byCategory(categories[0]);

  return {

    byIndex,

    type: function(t) {

      if (type !== t) {

        type = t;
        category = false;
        byCategory("two");
      }

      return this;
    },

    running: function() {

      this.setGameUrl((which = "running"));

      return this;
    },

    open: function() {

      this.setGameUrl((which = "open"));

      return this;
    },

    setGameUrl: function(type) {

      types.game.url = "games/" + type;
    },

    saved: function() {

      this.setGameUrl((which = "saved"));

      return this;
    },

    empty: function() {

      return !maps.length;
    },

    category: function() {

      return category;
    },

    setCategory: function(category) {

      return byCategory(category);
    },

    getAllPlayers: function() {

      return maps;
    },

    getPlayerById: function(id) {

      const map = byId(maps, id);

      if (map) {

        return format(map);
      }

      return false;
    },

    first: function() {

      return sub(maps[0]);
    },

    addPlayer: function(room) {

      return edit(types.game.items, room, function(games, room, index) {

        return isNaN(index) ? games.push(room) : (games[index] = room);
      });
    },

    remove: function(room) {

      return edit(types.game.items, room, function(games, room, index) {

        if (!isNaN(index) && !room.saved) {

          return games.splice(index, 1)[0];
        }
      });
    },

    removePlayer: function(room, player) {

      return edit(types.game.items, room, function(games, room, index) {

        if (!isNaN(index)) {

          (room = games[index]).players.splice(room.players.findIndex(function(p) {

            return position.id === player.id;

          }), 1)[0];
        }
      });
    },

    updated: function() {

      if (change) {

        change = false;
        return true;
      }
    },

    random: function() {

      byCategory(categories[app.calculate.random(categories.length - 1) || "two"], function(maps) {

        app.map.set([app.calculate.random(maps.length - 1)]);
      });
    },

    info: function() {

      return app.calculate.numberOfBuildings(byIndex(index || 0));
    },

    clear: function() {

      maps = [],
        category = undefined,
        index = undefined;
    },

    screen: function() {

      return types[type].elements;
    },

    save: function(map, name) {

      if ((error = validate.defined(app.user.email(), "email") || (error = validate.map(map)))) {

        throw error;
      }

      app.request.post(mapController.setCreator(app.user.id(), map), "maps/save", function(response) {

        change = true;
      });
    },
    //getbyid: function (id) { app.request.get(id, "maps/select", function (response) { app.mapEditor.set(response); }); },
  };
}
