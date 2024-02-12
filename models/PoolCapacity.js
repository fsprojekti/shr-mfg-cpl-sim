
const mongoose = require("mongoose");

exports.PoolCapacity = new mongoose.Schema({
    offersCapacity: [{type: mongoose.Schema.Types.ObjectId, ref: 'OfferCapacity'}],
},);

exports.PoolCapacity = mongoose.model('PoolCapacity', exports.PoolCapacity);

