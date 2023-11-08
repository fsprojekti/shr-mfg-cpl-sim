const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema( {
    //States ["IDLE", "MARKET","ACTIVE", "DONE"]
    state: {type: String, default: "IDLE"},
    //Cross-reference to Offer schema
    offers: [{type: mongoose.Schema.Types.ObjectId, ref: 'OfferDirect'}],
    //Start service timestamp
    startTimestamp: {type: Number},
    //End service timestamp
    endTimestamp: {type: Number},
    //Duration in seconds default to 1 hour
    duration: {type: Number, default: 3600},
    //Service consumer id
    consumer: {type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true},
    //Service provider id
    idProvider: {type: mongoose.Schema.Types.ObjectId, ref: 'Provider'},
    //Count
    count: {type: Number, default: 0},
});

module.exports = mongoose.model('Service', serviceSchema);
