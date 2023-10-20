const OfferDirect = require('../models/OfferDirect');
const emitter = require('../utils/events').eventEmitter;

exports.OfferDirect = OfferDirect;

const serviceAccount = require("./Account");
const serviceProvider = require("./Provider");
const serviceConsumer = require("./Consumer");

const logger = require('../utils/logger');

exports.create = (service, price, expiryTimestamp) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceOfferDirect.create() called with service: " + service._id + " price: " + price + " expiryTimestamp: " + expiryTimestamp);
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
            logger.info("serviceOfferDirect.create() created offer direct: " + offerDirect._id);
            resolve(offerDirect);
        } catch (e) {
            reject(e);
        }
    })
}

exports.send = (offerDirect, provider) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceOfferDirect.send() called with offerDirect: " + offerDirect._id + " provider: " + provider._id);
            //Reject if offer not in state IDLE
            if (offerDirect.state !== "IDLE") reject("Offer not in state IDLE");
            //Reject if provider not defined
            if (!provider) reject("Provider not defined");
            offerDirect.idBuyer = provider.idAccount;
            logger.silly("serviceOfferDirect.send() offerDirect idBuyer set to provider idAccount: " + offerDirect.idBuyer);
            offerDirect.state = "MARKET";
            logger.silly("serviceOfferDirect.send() offerDirect state set to MARKET: " + offerDirect.state);
            await offerDirect.save();
            //Send offer to provider
            logger.silly("serviceOfferDirect.send() sending offer direct to provider:" + offerDirect._id);
            await serviceProvider.offerDirectReceived(offerDirect);
            logger.silly("serviceOfferDirect.send() sent offer direct to provider:" + offerDirect._id);
            //Start expiry timer
            logger.silly("serviceOfferDirect.send() starting expiry timer for offer direct:" + offerDirect._id);
            setTimeout(async (offerDirect) => {
                logger.info("serviceOfferDirect.send() expiry timer expired for offer direct:" + offerDirect._id);
                //Check if offer is in state ACCEPTED or REJECTED
                if (offerDirect.state === "ACCEPTED") {
                    logger.silly("serviceOfferDirect.send() offer direct state is ACCEPTED: " + offerDirect._id);
                    return
                }
                if (offerDirect.state === "REJECTED") {
                    logger.silly("serviceOfferDirect.send() offer direct state is REJECTED: " + offerDirect._id);
                    return
                }
                offerDirect.state = "EXPIRED";
                await offerDirect.save();
                logger.silly("serviceOfferDirect.send() offer direct state set to EXPIRED: " + offerDirect._id);
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
});

emitter.on('offerDirectExpired', async (offerDirect) => {
    try {
        console.log("offerDirectExpired");
        console.log(offerDirect);
    } catch (e) {
        console.log(e);
    }
});