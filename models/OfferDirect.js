const {mongoose} = require('mongoose');

const offerDirectSchema = new mongoose.Schema({
        idAccountSeller: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
        idAccountBuyer: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
        price: {type: Number, required: true},
        expiryTimestamp: {type: Number},
        //states ["IDLE", "MARKET", "EXPIRED", "ACCEPTED", "REJECTED"]
        state: {type: String, default: "IDLE"},
        //Index of offer direct
        count: {type: Number, required: true},
    },
    {timestamps: true})

module.exports = mongoose.model('OfferDirect', offerDirectSchema);