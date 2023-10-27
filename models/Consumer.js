const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

exports.Consumer = Schema("Consumers", {
    //Cross-reference to Account schema
    idAccount: {type: String, required: true},
    //Cross-reference to Service schema
    idServices: [{type: String, ref: 'Service'}],
},);


