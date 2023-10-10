const config = require('../config.json');
const Consumer = require('../models/Consumer');
const emitter = require('../utils/events').eventEmitter;

const serviceService = require("./Service");
const serviceProvider = require("./Provider");
const serviceOfferDirect = require("./OfferDirect");

exports.Consumer = Consumer;

exports.create = (account) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if account not defined
            if (!account) reject("Account not defined");
            let consumer = new Consumer({
                idAccount: account._id,
            });
            await consumer.save();
            resolve(consumer);
        } catch (e) {
            reject(e);
        }
    })
}

exports.start = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if consumer not defined
            if (!consumer) reject("Consumer not defined");
            //Get consumer last service by the max value of parameter count use mongodb query
            let service = await serviceService.Service.find({idConsumer: consumer._id}).sort((a, b) => b.count - a.count)[0];
            //Reject if service exists and is not in states IDLE or DONE
            if (service && service.state !== "IDLE" && service.state !== "DONE") reject("Service exists and is not in states IDLE or DONE");
            //If service not exists create new service
            if (!service) service = await serviceService.create(consumer);
            //Put service on a market
            await serviceService.market(service, consumer.price);
            resolve(consumer);
        } catch (e) {
            reject(e);
        }
    })
}

exports.rentService = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if consumer not defined
            if (!consumer) reject("Consumer not defined");
            //Get last service by the max value of parameter count use mongodb query
            let service = await serviceService.Service.find({idConsumer: consumer._id}).sort((a, b) => b.count - a.count)[0];
            //



            switch (service.state) {
                case undefined:
                case "IDLE":
                case "DONE":{
                    //Create new service
                    service = await serviceService.create(consumer);
                }
                    break;
                case "MARKET": {
                    //Reject if service active offer exists
                    let offer = await serviceService.getOfferDirectMarket(service);
                    if (offer) reject("Active offer exists on market for this service");


                }
                    break;
                case "ACTIVE":{
                    reject("Service active, can't rent new one");
                }
                    break;
            }
            //If service not exists create new service
            if (!service) service = await serviceService.create(consumer);
            //Put service on a market
            await serviceService.market(service, consumer.price);
            resolve(consumer);

        } catch (e) {

        }
    })
}

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

//Subscribe to event offerDirectAccept
emitter.on('offerDirectAccepted', (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Log event with offerDirect
            console.log('\x1b[32m%s\x1b[0m', "Event: offerDirectAccepted, id: " + offerDirect._id.toString());
            //Get service by offerDirect
            let service = await serviceService.Service.findOne({_id: offerDirect.idService});
            //Reject if service not found
            if (!service) reject("Service not found");
            //Get consumer by service
            let consumer = await Consumer.findOne({_id: service.idConsumer});
            //Reject if consumer not found
            if (!consumer) reject("Consumer not found");
            await serviceService.start(service);
            resolve(consumer);
        } catch (e) {
            reject(e);
        }
    })

});

emitter.on('offerDirectRejected', async (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Log event with offerDirect in red color and streamline offerDirect object to single line
            console.log('\x1b[31m%s\x1b[0m', "Event: offerDirectRejected, id: " + offerDirect._id.toString());


        } catch (e) {

        }
    })

})

//Subscribe to event offerDirectExpired
emitter.on('offerDirectExpired', async (offerDirect) => {
    //Log event with offerDirect in yellow color and streamline offerDirect object to single line
    console.log('\x1b[33m%s\x1b[0m', "Event: offerDirectExpired, id: " + offerDirect._id.toString());
});

//Subscribe to event serviceCompleted
emitter.on('serviceCompleted', async (service) => {
    //Log event with service in green color
    console.log('\x1b[32m%s\x1b[0m', "serviceCompleted", service);

});

