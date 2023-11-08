const mongoose = require('mongoose');

const offerDirectSchema = new mongoose.Schema({
    seller: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
    buyer: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
    price: {type: Number, required: true},
    expiryTimestamp: {type: Number},
    //states ["IDLE", "MARKET", "EXPIRED", "ACCEPTED", "REJECTED"]
    state: {type: String, default: "IDLE"},
    //Index of offer direct
    count: {type: Number, required: true},
    //Cross-reference to Service schema
    service: {type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true}
})

module.exports = mongoose.model('OfferDirect', offerDirectSchema);
