const OfferDirect = require('../models/OfferDirect');
const emitter = require('../utils/events').eventEmitter;

exports.OfferDirect = OfferDirect;

const serviceConsumer = require("./Consumer");

const logger = require('../utils/logger');



exports.create = (service, price, expiryTimestamp) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceOfferDirect.create() called with service: " + service.id + " price: " + price + " expiryTimestamp: " + expiryTimestamp);
            let count = await OfferDirect.countDocuments({service: service.id});
            //Get consumer
            let consumer = await serviceConsumer.Consumer.findById(service.consumer);
            let offerDirect = new OfferDirect({
                seller: consumer.account,
                service: service.id,
                price: price,
                expiryTimestamp: expiryTimestamp,
                count: count
            });
            logger.info("serviceOfferDirect.create() created offer direct: " + offerDirect.id);
            resolve(offerDirect);
        } catch (e) {
            logger.error("serviceOfferDirect.create() error: " + e);
            reject(e);
        }
    })
}

exports.commence = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceOfferDirect.commence() called with offerDirect: " + offerDirect.id);
            setTimeout(async () => {
                //Check if offer is in state ACCEPTED or REJECTED
                if (offerDirect.state === "ACCEPTED") return
                if (offerDirect.state === "REJECTED") return
                offerDirect.state = "EXPIRED";
                await offerDirect.save();
                logger.verbose("serviceOfferDirect.commence() offer direct state set to EXPIRED: " + offerDirect.id);
                //Emit event offerDirectExpired
                emitter.emit('offerDirectExpired', offerDirect);
            })
            resolve(offerDirect);
        } catch (e) {
            logger.error("serviceOfferDirect.commence() error: " + e);
            reject(e);
        }
    })
}