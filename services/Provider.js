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

exports.offerDirectReceived = (provider, offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if provider not defined
            if (!provider) reject("Provider not defined");
            //Reject if offer not defined
            if (!offerDirect) reject("Offer not defined");
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") reject("Offer not in state MARKET");
            //Reject if offer not in state MARKET
            if (offerDirect.idBuyer !== provider.idAccount) reject("Provider not match");
            offerDirect.state = "ACTIVE";
            await offerDirect.save();
            //Emit event offerDirectAccepted
            emitter.emit('offerDirectAccepted', offerDirect);
            resolve(offerDirect);
        } catch (e) {
            reject(e);
        }
    })
}

//Events
emitter.on('offerDirectSend', (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Event offerDirectSend");
            //Get provider
            let provider = await Provider.findOne({idAccount: offerDirect.idBuyer});
            //Reject if provider not found
            if (!provider) reject("Provider not found");
            this.offerDirectReceived(provider, offerDirect);
        } catch (e) {
            console.log(e);
        }
    })
});

