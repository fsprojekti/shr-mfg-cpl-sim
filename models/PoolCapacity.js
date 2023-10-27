const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

exports.PoolCapacity = Schema("PoolsCapacity",{
    idOfferCapacity: {type: String, required: true},
},);

