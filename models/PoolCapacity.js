
const mongoose = require("mongoose");
const {models} = require("mongoose");

let PoolCapacity = new mongoose.Schema({
    offers: [{type: mongoose.Schema.Types.ObjectId, ref: 'OfferCapacity'}],
    providers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Provider'}],
},);

module.exports = mongoose.model('PoolCapacity', PoolCapacity);

