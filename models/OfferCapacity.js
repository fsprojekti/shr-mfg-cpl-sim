const {mongoose} = require('mongoose');

const offerCapacitySchema = new mongoose.Schema({
        idSeller: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
        idBuyer: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
        //Cross-reference to Offer schema
        idOffer: {type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true},
        price: {type: Number, required: true},
        fee: {type: Number, default: 0},
        expiryTimestamp: {type: Number, required: true},
        //states ["IDLE", "MARKET", "EXPIRED", "ACCEPTED", "REMOVED"]
        state: {type: String, default: "IDLE"},
    },
    {timestamps: true});

module.exports = mongoose.model('OfferCapacity', offerCapacitySchema);