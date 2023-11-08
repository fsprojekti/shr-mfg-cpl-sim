const {mongoose} = require('mongoose');

const consumerSchema=new mongoose.Schema( {
    //Cross-reference to Account schema
    idAccount: {type: mongoose.Schema.Types.ObjectId, ref: 'Account'},
    //Cross-reference to Service schema
    services: [{type: mongoose.Schema.Types.ObjectId, ref: 'Service'}],
});

module.exports = mongoose.model('Consumer', consumerSchema);


