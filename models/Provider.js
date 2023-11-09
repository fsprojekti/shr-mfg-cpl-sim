const mongoose = require("mongoose");
const config = require("../config");

const providerSchema =new mongoose.Schema( {
        //Cross-reference to Account schema
        account: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
        //Cross-reference to Service schema
        services: [{type: mongoose.Schema.Types.ObjectId, ref: 'Service'}],
        //Max services
        servicesLimit: {type: Number, default: config.provider.servicesLimit},
    });

module.exports = mongoose.model('Provider', providerSchema);