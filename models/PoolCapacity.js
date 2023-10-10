const {mongoose} = require('mongoose');

const poolCapacitySchema = new mongoose.Schema({
        idOfferCapacity: {type: mongoose.Schema.Types.ObjectId, ref: 'OfferCapacity', required: true},
    },
    {timestamps: true}
)

module.exports = mongoose.model('PoolCapacity', poolCapacitySchema);
