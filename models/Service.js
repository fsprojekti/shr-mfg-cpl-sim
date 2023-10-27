const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

exports.Service = Schema("Services", {
    //States ["IDLE", "MARKET","ACTIVE", "DONE"]
    state: {type: String, default: "IDLE"},
    //Cross-reference to Offer schema
    idOffers: [{type: String}],
    //Start service timestamp
    startTimestamp: {type: Number},
    //End service timestamp
    endTimestamp: {type: Number},
    //Duration in seconds default to 1 hour
    duration: {type: Number, default: 3600},
    //Service consumer id
    idConsumer: {type: String, required: true},
    //Service provider id
    idProvider: {type: String},
    //Count
    count: {type: Number, default: 0},
},);
