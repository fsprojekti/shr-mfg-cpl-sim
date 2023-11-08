const {mongoose} = require('mongoose');

const accountSchema = new mongoose.Schema({
        balance: {type: Number, default: 100},
    },
);

module.exports = mongoose.model('Account', accountSchema);