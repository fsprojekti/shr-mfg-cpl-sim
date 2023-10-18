const {mongoose} = require('mongoose');

const serviceSchema = new mongoose.Schema({
        //States ["IDLE", "MARKET","OFFER_REJECTED","OFFER_EXPIRED","ACTIVE", "DONE"]
        state: {type: String, default: "IDLE"},
        //Cross-reference to Offer schema
        idOffers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Offer'}],
        //Start service timestamp
        startTimestamp: {type: Number},
        //End service timestamp
        endTimestamp: {type: Number},
        //Duration in seconds default to 1 hour
        duration: {type: Number, default: 3600},
        //Service consumer id
        idConsumer: {type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true},
        //Service provider id
        idProvider: {type: mongoose.Schema.Types.ObjectId, ref: 'Provider'},
        //Count
        count: {type: Number, default: 0},
    },
    {timestamps: true})

module.exports = mongoose.model('Service', serviceSchema);