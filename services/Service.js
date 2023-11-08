const Service = require('../models/Service');
const emitter = require('../utils/events').eventEmitter;
const serviceOffer = require("./OfferDirect");
const serviceProvider = require("./Provider");
const config = require("../config.json");
const logger = require('../utils/logger');

exports.Service = Service;

exports.create = (consumer) => {
    return new Promise((resolve, reject) => {
        try {
            logger.silly("serviceService.create() called with consumer: "+ consumer._id);
            //Get number of services of consumer
            let count = Service.find({idConsumer: consumer._id}).length;
            let service = Service.create({
                idConsumer: consumer._id,
                duration: config.service.duration,
                count: count
            }).save();
            logger.info("serviceService.create() created service: "+service._id);
            resolve(service);
        } catch (e) {
            reject(e);
        }
    })
}

exports.rent = (service, price, expiryTimestamp, provider) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceService.rent() called with service: "+ service._id+" price: "+price+" expiryTimestamp: "+expiryTimestamp+" provider: "+provider._id);
            //Create offer direct
            logger.silly("serviceService.rent() creating offer direct");
            let offer = await serviceOffer.create(service, price, expiryTimestamp);
            logger.silly("serviceService.rent() created offer direct: "+offer._id);
            //Set state to MARKET
            service.state = "MARKET";
            await service.save();
            logger.verbose("serviceService.rent() service state set to MARKET: "+service._id);
            //Send offer direct
            logger.silly("serviceService.rent() sending offer direct");
            await serviceOffer.send(offer, provider);
            logger.silly("serviceService.rent() offer direct send: "+offer._id);

            resolve(offer);
        } catch (e) {
            reject(e);
        }
    })
}

exports.commence = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceService.commence() called with service: "+ service._id);
            //Reject if service not in state MARKET
            if (service.state !== "MARKET") reject("Service not in state MARKET");
            service.state = "ACTIVE";
            logger.verbose("serviceService.commence() service state set to ACTIVE: "+service._id);
            let time = Math.floor(Date.now());
            service.startTimestamp = time;
            logger.debug("serviceService.commence() service startTimestamp set to time: "+service.startTimestamp);
            service.endTimestamp = time + service.duration;
            logger.debug("serviceService.commence() service endTimestamp set to time: "+service.endTimestamp);
            await service.save();
            emitter.emit('serviceCommenced', service);
            logger.silly("serviceService.commence() serviceCommenced timer started: "+service._id);
            setTimeout(async () => {
                logger.info("serviceService.commence() serviceCommenced timer expired: "+service._id);
                await this.complete(service);
            }, service.endTimestamp - time);
            resolve(service);
        } catch (e) {
            logger.error("serviceService.commence() error: "+e);
            reject(e);
        }
    })
}

exports.complete = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info("serviceService.complete() called with service: "+ service._id);
            //Reject if service not in state ACTIVE
            if (service.state !== "ACTIVE") reject("Service not in state ACTIVE");
            service.state = "DONE";
            logger.verbose("serviceService.complete() service state set to DONE: "+service._id);
            emitter.emit('serviceCompleted', service);
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

//Event offer direct expired
emitter.on('offerDirectExpired', (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.debug("Event ON offerDirectExpired with offerDirect: "+offerDirect._id);
            //Get service of offer direct
            let service = await Service.findOne({_id: offerDirect.idService});
            //Reject if service not found
            if (!service) reject("Service not found");
            //continue with renting service
            await this.rent(service, await clcPrice(service), await clcExpiryTimestamp(service), await clcProvider(service));
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
            logger.debug("Event ON offerDirectRejected with offerDirect: "+offerDirect._id);
            //Get service of offer direct
            let service = await Service.findOne({_id: offerDirect.idService});
            //Reject if service not found
            if (!service) reject("Service not found");
            //Put service on market with new offer
            await this.rent(service, await clcPrice(service), await clcExpiryTimestamp(service), await clcProvider(service));
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


