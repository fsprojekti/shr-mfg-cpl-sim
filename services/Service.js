const Service = require('../models/Service');
const emitter = require('../utils/events').eventEmitter;
const serviceOffer = require("./OfferDirect");

exports.Service = Service;

exports.create = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            let service = new Service({
                idConsumer: consumer._id,
            });
            await service.save();
            resolve(service);
        } catch (e) {
            reject(e);
        }
    })
}

exports.market = (service, price, expiryTimestamp, provider) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if service not in state IDLE
            if (service.state !== "IDLE") reject("Service not in state IDLE");
            //Reject if price not defined
            if (!price) reject("Price not defined");
            //Reject if price is not a number
            if (typeof price !== "number") reject("Price is not a number");
            //Reject if price is not a positive number
            if (price <= 0) reject("Price is not a positive number");
            service.price = price;
            //Generate an offer for this service
            let offer = await serviceOffer.create(service, price, expiryTimestamp);
            //Send offer
            await serviceOffer.send(offer, provider);
            //Change service state to MARKET
            service.state = "MARKET";
            await service.save();
            resolve(service);
        } catch (e) {
            reject(e);
        }
    })
}

exports.get = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let service = await Service.findOne({_id: id});
            resolve(service);
        } catch (e) {
            reject(e);
        }
    })
}

exports.commence = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Get offer for this service
            let offer = await serviceOffer.OfferDirect.findOne({idService: service._id});
            //Reject if offer not exists
            if (!offer) reject("Offer direct not exists");
            //Reject if offer not in state ACCEPTED
            if (offer.state !== "ACCEPTED") reject("Offer direct not in state ACCEPTED");
            //Reject if service not in state MARKET
            if (service.state !== "MARKET") reject("Service not in state MARKET");
            service.state = "ACTIVE";
            let time = Math.floor(Date.now() / 1000);
            service.startTimestamp = time;
            service.endTimestamp = time + service.duration;
            await service.save();
            emitter.emit('serviceCommenced', service);
            setTimeout(async () => {
                service.state = "DONE";
                await service.save();
                emitter.emit('serviceCompleted', service);
            }, service.endTimestamp - time);
            resolve(service);
        } catch (e) {
            reject(e);
        }
    })
}

exports.getOffersDirect = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            let offers = await serviceOffer.OfferDirect.find({idService: service._id});
            resolve(offers);
        } catch (e) {
            reject(e);
        }
    })
}

exports.getOfferDirectMarket = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            let offer = await serviceOffer.OfferDirect.findOne({idService: service._id, state: "MARKET"});
            resolve(offer);
        } catch (e) {
            reject(e);
        }
    })
}
