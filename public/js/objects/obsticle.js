module.exports = function (type, defense) {
    this.type = function () { return type };
    this.defense = function () { return defense };
};