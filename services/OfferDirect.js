const OfferDirect = require('../models/OfferDirect');
const emitter = require('../utils/events').eventEmitter;

exports.OfferDirect = OfferDirect;

exports.create = (service, price, expiryTimestamp) => {
    return new Promise(async (resolve, reject) => {
        try {
            let offerDirect = new OfferDirect({
                idSeller: service.idConsumer,
                idService: service._id,
                price: price,
                expiryTimestamp: expiryTimestamp
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
            offerDirect.idBuyer = provider._id;
            offerDirect.state = "MARKET";
            await offerDirect.save();
            //Start expiry timer
            setTimeout(async () => {
                //Set state to EXPIRED
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

exports.accept = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") reject("Offer not in state MARKET");
            offerDirect.state = "ACCEPTED";
            await offerDirect.save();
            //Emit event offerDirectAccept
            emitter.emit('offerDirectAccept', offerDirect);
            resolve(offerDirect)
        } catch (e) {
            reject(e);
        }
    })
}

exports.reject = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") reject("Offer not in state MARKET");
            offerDirect.state = "REJECTED";
            await offerDirect.save();
            //Emit event offerDirectReject
            emitter.emit('offerDirectReject', offerDirect);
            resolve(offerDirect)
        } catch (e) {
            reject(e);
        }
    })
}