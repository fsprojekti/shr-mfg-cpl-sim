const {mongoose} = require('mongoose');

const consumerSchema = new mongoose.Schema({
        //Cross-reference to Account schema
        idAccount: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
        //Cross-reference to Service schema
        idServices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Service'}],
    },
    {timestamps: true});

module.exports = mongoose.model('Consumer', consumerSchema);