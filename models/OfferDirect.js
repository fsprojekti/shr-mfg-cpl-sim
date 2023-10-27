const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

exports.OfferDirect = Schema("OffersDirect", {
    idAccountSeller: {type: String, required: true},
    idAccountBuyer: {type: String},
    price: {type: Number, required: true},
    expiryTimestamp: {type: Number},
    //states ["IDLE", "MARKET", "EXPIRED", "ACCEPTED", "REJECTED"]
    state: {type: String, default: "IDLE"},
    //Index of offer direct
    count: {type: Number, required: true},
    //Cross-reference to Service schema
    idService: {type: String, required: true},
})
