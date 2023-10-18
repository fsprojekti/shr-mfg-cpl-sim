const Service = require('../models/Service');
const emitter = require('../utils/events').eventEmitter;
const serviceOffer = require("./OfferDirect");
const serviceProvider = require("./Provider");
const config = require("../config.json");

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

exports.market = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if service not defined
            if (!service) reject("Service not defined");
            //Reject if service not in state IDLE or OFFER_REJECTED or OFFER_EXPIRED
            if (service.state !== "IDLE" && service.state !== "OFFER_REJECTED" && service.state !== "OFFER_EXPIRED") reject("Service not in state IDLE or OFFER_REJECTED or OFFER_EXPIRED")
            let price = 0;
            let expiryTimestamp = 0;
            let provider = null;
            //Switch for each state
            switch (service.state) {
                case "IDLE": {
                    price = await clcPrice(service);
                    expiryTimestamp = await clcExpiryTimestamp(service);
                    provider = await clcProvider(service);
                }
                    break;
                case "OFFER_REJECTED": {
                    price = await clcPrice(service);
                    expiryTimestamp = await clcExpiryTimestamp(service);
                    provider = await clcProvider(service);
                }
                    break;
                case "OFFER_EXPIRED":{
                    price = await clcPrice(service);
                    expiryTimestamp = await clcExpiryTimestamp(service);
                    provider = await clcProvider(service);
                }
            }
            //Create offer direct
            let offer = await serviceOffer.create(service, price, expiryTimestamp);
            //Send offer direct
            await serviceOffer.send(offer, provider);
            //Set state to MARKET
            service.state = "MARKET";
            await service.save();
            resolve(offer);
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
                await this.complete(service);
                emitter.emit('serviceCompleted', service);
            }, service.endTimestamp - time);
            resolve(service);
        } catch (e) {
            reject(e);
        }
    })
}

exports.complete = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if service not in state ACTIVE
            if (service.state !== "ACTIVE") reject("Service not in state ACTIVE");
            service.state = "DONE";
            await service.save();
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

//Event offer direct expired and rejected
emitter.on('offerDirectExpired', (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Get service of offer direct
            let service = await Service.findOne({_id: offerDirect.idService});
            //Reject if service not found
            if (!service) reject("Service not found");
            //Set state to OFFER_EXPIRED
            service.state = "OFFER_EXPIRED";
            await service.save();
            //Put service on market with new offer
            await this.market(service, await clcPrice(service), await clcExpiryTimestamp(service), await clcProvider(service));
            //Get new offer direct
            let offer = await this.getOfferDirectMarket(service);
            resolve(offer);
        } catch (e) {
            reject(e);
        }
    })
})

emitter.on('offerDirectRejected', (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Get service of offer direct
            let service = await Service.findOne({_id: offerDirect.idService});
            //Reject if service not found
            if (!service) reject("Service not found");
            //Set state to OFFER_REJECTED
            service.state = "OFFER_REJECTED";
            await service.save();
            //Put service on market with new offer
            await this.market(service, await clcPrice(service), await clcExpiryTimestamp(service), await clcProvider(service));
            //Get new offer direct
            let offer = await this.getOfferDirectMarket(service);
            resolve(offer);
        } catch (e) {
            reject(e);
        }
    })
})

emitter.on('offerDirectAccept', (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Get service of offer direct
            let service = await Service.findOne({_id: offerDirect.idService});
            //Reject if service not found
            if (!service) reject("Service not found");
            //Commence service
            await this.commence(service);
            resolve(service);
        } catch (e) {
            reject(e);
        }
    })
})

let clcPrice = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(1.0);
        } catch (e) {
            reject(e);

        }
    })
}

let clcProvider = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Get list of providers and chose random provider
            let providers = await serviceProvider.Provider.find();
            let provider = providers[Math.floor(Math.random() * providers.length)];
            resolve(provider);
        } catch (e) {
            reject(e);

        }
    })
}

let clcExpiryTimestamp = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(config.agentConsumer.settingsOffer.expiryDuration + Math.floor(Date.now() / 1000));
        } catch (e) {
            reject(e);
        }
    })
}


