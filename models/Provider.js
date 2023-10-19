const {mongoose} = require('mongoose');

const providerSchema = new mongoose.Schema({
        //Cross-reference to Account schema
        idAccount: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
        //Cross-reference to Service schema
        idServices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Service'}],
        //Max services
        servicesLimit: {type: Number, default: 5},
    },
    {timestamps: true});

module.exports = mongoose.model('Provider', providerSchema);