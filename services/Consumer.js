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

exports.rentService = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if consumer not defined
            if (!consumer) reject("Consumer not defined");
            //Find services of consumer and sort by count from highest to lowest
            let service = await serviceService.Service.find({idConsumer: consumer._id}).sort({count: -1})[0];
            if (service) {
                //Reject if last service is in state ACTIVE
                if (service.state === "ACTIVE") reject("Last service is in state ACTIVE");
                //Reject if last service is in state MARKET
                if (service.state === "MARKET") reject("Last service is in state MARKET");
            }else{
                service = await serviceService.create(consumer);
            }
            // Calculate price
            let price = await clcOfferPrice(service);
            // Calculate expiry timestamp
            let expiryTimestamp = await clcOfferDuration(service) + Math.floor(Date.now() / 1000);
            // Calculate offer provider
            let provider = await clcOfferProvider(service);

            //Create offer direct
            let offerDirect = await serviceOfferDirect.create(service, price, expiryTimestamp);

            //Send offer direct
            offerDirect = await serviceOfferDirect.send(offerDirect, provider);


        } catch (e) {
            reject(e);
        }
    })
}

let clcOfferPrice = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Random price from 1 to 10
            let price = Math.floor(Math.random() * 10) + 1;
            resolve(price);
        } catch (e) {
            reject(e);
        }
    })
}

let clcOfferDuration = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(3600);
        } catch (e) {
            reject(e);
        }
    })
}

let clcOfferProvider = (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            let provider = await serviceProvider.Provider.findOne();
            resolve(provider);
        } catch (e) {
            reject(e);
        }
    })
}