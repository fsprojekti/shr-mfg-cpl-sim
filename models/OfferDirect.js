const {mongoose} = require('mongoose');

const offerDirectSchema = new mongoose.Schema({
        idSeller: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
        idBuyer: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
        price: {type: Number, required: true},
        expiryTimestamp: {type: Number},
        //states ["IDLE", "MARKET", "EXPIRED", "ACCEPTED", "REJECTED"]
        state: {type: String, default: "IDLE"},
    },
    {timestamps: true})

module.exports = mongoose.model('OfferDirect', offerDirectSchema);