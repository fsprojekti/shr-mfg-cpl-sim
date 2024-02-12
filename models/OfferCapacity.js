const mongoose = require("mongoose");

const offerCapacitySchema = new mongoose.Schema({
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
    buyer: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
    //Cross-reference to Offer schema
    offerDirect: {type: mongoose.Schema.Types.ObjectId, ref: 'OfferDirect', required: true},
    price: {type: Number, required: true},
    fee: {type: Number, default: 0},
    expiryTimestamp: {type: Number, required: true},
    //states ["IDLE", "MARKET", "EXPIRED", "ACCEPTED", "REMOVED"]
    state: {type: String, default: "IDLE"},
});

module.exports = mongoose.model('OfferCapacity', offerCapacitySchema);