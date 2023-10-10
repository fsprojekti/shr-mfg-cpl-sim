const Provider = require('../models/Provider');
const emitter = require('../utils/events').eventEmitter;

exports.Provider = Provider;

exports.create = (account) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if account not defined
            if (!account) reject("Account not defined");
            let provider = new Provider({
                idAccount: account._id,
            });
            await provider.save();
            resolve(provider);
        } catch (e) {
            reject(e);
        }
    })
}

