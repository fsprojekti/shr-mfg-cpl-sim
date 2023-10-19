const OfferDirect = require('../models/OfferDirect');
const emitter = require('../utils/events').eventEmitter;

exports.OfferDirect = OfferDirect;

const serviceAccount = require("./Account");
const serviceProvider = require("./Provider");
const serviceConsumer = require("./Consumer");

exports.create = (service, price, expiryTimestamp) => {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await OfferDirect.countDocuments({idService: service._id});
            //Get consumer
            let consumer = await serviceConsumer.Consumer.findById(service.idConsumer);
            let offerDirect = new OfferDirect({
                idAccountSeller: consumer.idAccount,
                idService: service._id,
                price: price,
                expiryTimestamp: expiryTimestamp,
                count: count
            });
            await offerDirect.save();
            resolve(offerDirect);
        } catch (e) {
            reject(e);
        }
    })
}

exports.send = (offerDirect, provider) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if offer not in state IDLE
            if (offerDirect.state !== "IDLE") reject("Offer not in state IDLE");
            //Reject if provider not defined
            if (!provider) reject("Provider not defined");
            offerDirect.idBuyer = provider.idAccount;
            offerDirect.state = "MARKET";
            await offerDirect.save();
            //Send offer to provider
            await serviceProvider.offerDirectReceived(offerDirect);
            //Start expiry timer
            setTimeout(async (offerDirect) => {
                //Check if offer is in state ACCEPTED or REJECTED
                if (offerDirect.state === "ACCEPTED" || offerDirect.state === "REJECTED") return;
                offerDirect.state = "EXPIRED";
                await offerDirect.save();
                //Emit event offerDirectExpired
                emitter.emit('offerDirectExpired', offerDirect);
            }, offerDirect.expiryTimestamp - Math.floor(Date.now() / 1000))
            resolve(offerDirect)
        } catch (e) {
            reject(e);
        }
    })
}

//Events
emitter.on('offerDirectAccepted', async (offerDirect) => {
    try {
        console.log("offerDirectSend");
        console.log(offerDirect);
    } catch (e) {
        console.log(e);
    }
});

emitter.on('offerDirectRejected', async (offerDirect) => {
    try {
        console.log("offerDirectReject");
        console.log(offerDirect);
    } catch (e) {
        console.log(e);
    }
}   );

emitter.on('offerDirectExpired', async (offerDirect) => {
    try {
        console.log("offerDirectExpired");
        console.log(offerDirect);
    } catch (e) {
        console.log(e);
    }
});