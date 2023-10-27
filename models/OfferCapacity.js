const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

exports.Capacity = Schema("OffersCapacity",{
    idSeller: {type: String, required: true},
    idBuyer: {type: String},
    //Cross-reference to Offer schema
    idOffer: {type: String, required: true},
    price: {type: Number, required: true},
    fee: {type: Number, default: 0},
    expiryTimestamp: {type: Number, required: true},
    //states ["IDLE", "MARKET", "EXPIRED", "ACCEPTED", "REMOVED"]
    state: {type: String, default: "IDLE"},

});