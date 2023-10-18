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
            let services = await serviceService.Service.find({idConsumer: consumer._id}).sort({count: -1});
            //Reject if first service is in state MARKET
            if (services[0].state === "MARKET") reject("Can't rent new service while a previous service is in state MARKET");
            //Reject if fist service is in state ACTIVE
            if (services[0].state === "ACTIVE") reject("Can't rent new service while a previous service is in state ACTIVE");

            let service = await serviceService.create(consumer);


        } catch (e) {
            reject(e);
        }
    })
}
