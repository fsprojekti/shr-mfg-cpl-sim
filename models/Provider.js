const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

exports.Provider = Schema("Providers", {
        //Cross-reference to Account schema
        idAccount: {type: String, required: true},
        //Cross-reference to Service schema
        idServices: [{type: String}],
        //Max services
        servicesLimit: {type: Number, default: 5},
    });