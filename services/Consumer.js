const config = require('../config.json');
const Consumer = require('../models/Consumer');
const emitter = require('../utils/events').eventEmitter;


const serviceService = require("./Service");
const serviceProvider = require("./Provider");
const serviceOfferDirect = require("./OfferDirect");
const serviceAccount = require("./Account");
const logger = require('../utils/logger');

exports.Consumer = Consumer;

exports.create = async (account) => {
    try {
        logger.silly("serviceCustomer.create() called with: accountId: " + account.id);
        //Reject if account not defined
        if (!account) throw ("Account not defined");
        let consumer = new Consumer({
            account: account.id,
        });
        await consumer.save();
        logger.info("serviceCustomer.create() created consumer with consumerId: " + consumer.id);
        return consumer;
    } catch (e) {
        logger.error("serviceCustomer.create() error: " + e);
        throw e;
    }
}

exports.rentService = (consumer) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceCustomer.rentService() called with: consumerId:  " + consumer._id);
            //Reject if consumer not defined
            if (!consumer) reject("Consumer not defined");
            //Find services of consumer and sort by count from highest to lowest
            let service = serviceService.Service.find({idConsumer: consumer._id}).sort((a, b) => {
                return b.count - a.count
            })[0];
            if (service) {
                //Reject if last service is in state ACTIVE
                if (service.state === "ACTIVE") reject("Last service is in state ACTIVE");

                if (service.state === "MARKET") {
                    //Reject if last offer direct is in state MARKET
                    let offerDirect = await serviceOfferDirect.OfferDirect.findOne({idService: service._id});
                    if (offerDirect.state === "MARKET") reject("Last offer direct is in state MARKET");
                }
                if (service.state === "DONE") {
                    logger.silly("serviceCustomer.rentService() no service found for consumer: " + consumer._id);
                    service = await serviceService.create(consumer);
                }
            } else {
                logger.silly("serviceCustomer.rentService() no service found for consumer: " + consumer._id);
                service = await serviceService.create(consumer);
            }
            // Calculate price
            let price = await clcOfferPrice(service);
            logger.debug("serviceCustomer.rentService() calculated price: " + price);
            // Calculate expiry timestamp
            let expiryTimestamp = await clcOfferDuration(service) + Math.floor(Date.now() / 1000);
            logger.debug("serviceCustomer.rentService() calculated expiryTimestamp: " + expiryTimestamp);
            // Calculate offer provider
            let provider = await clcOfferProvider(service);
            logger.debug("serviceCustomer.rentService() calculated provider: " + provider._id);

            //Rent service
            logger.silly("serviceCustomer.rentService() renting service: " + service._id);
            let offerDirect = await serviceService.rent(service, price, expiryTimestamp, provider);
            resolve(offerDirect);
        } catch (e) {
            logger.error("serviceCustomer.rentService() error: " + e);
            reject(e);
        }
    })
}

exports.offerDirectAccepted = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceCustomer.offerDirectAccepted() called with offerDirect: " + offerDirect._id);
            //Reject if offer not defined
            if (!offerDirect) reject("Offer not defined");
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") reject("Offer not in state MARKET");
            //Get account from offer direct
            let account = await serviceAccount.Account.findOne({_id: offerDirect.idAccountSeller});
            //Get consumer of service
            let consumer = await Consumer.findOne({idAccount: account._id});
            //Reject if consumer not found
            if (!consumer) reject("Consumer not found to rent service");
            //Change state of offer direct to ACCEPTED
            offerDirect.state = "ACCEPTED";
            await offerDirect.save();
            logger.verbose("serviceCustomer.offerDirectAccepted() offer direct state set to ACCEPTED: " + offerDirect._id);
            resolve(offerDirect);
        } catch (e) {
            logger.error("serviceCustomer.offerDirectAccepted() error: " + e);
            reject(e);
        }
    })

}

exports.offerDirectRejected = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceCustomer.offerDirectRejected() called with offerDirect: " + offerDirect._id);
            //Reject if offer not defined
            if (!offerDirect) reject("Offer not defined");
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") reject("Offer not in state MARKET");
            //Get consumer of service
            let consumer = await Consumer.findOne({_id: offerDirect.idBuyer});
            //Reject if consumer not found
            if (!consumer) reject("Consumer not found to rent service");
            //Change state of offer direct to REJECTED
            offerDirect.state = "REJECTED";
            await offerDirect.save();
            logger.verbose("serviceCustomer.offerDirectRejected() offer direct state set to REJECTED: " + offerDirect._id);
            //Rent service again
            logger.silly("serviceCustomer.offerDirectRejected() renting service again: " + offerDirect._id);
            await this.rentService(consumer);
            resolve(offerDirect);
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


//Events

//Service completed
emitter.on('serviceCompleted', (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            //log current time
            logger.debug("Event ON serviceCompleted caught at Consumer with service: " + service._id);
            //Get consumer of service
            let consumer = await Consumer.findOne({_id: service.idConsumer});
            //Reject if consumer not found
            if (!consumer) reject("Consumer not found to rent service");
            //Rent new service
            await this.rentService(consumer);
            resolve(service);
        } catch (e) {
            console.log(e);
        }
    })
});

//Offer direct expired
emitter.on('offerDirectExpired', (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.debug("Event offerDirectExpired caught at Consumer with offerDirect: " + offerDirect._id);
            //Get consumer of service
            let consumer = await Consumer.findOne({_id: offerDirect.idBuyer});
            //Reject if consumer not found
            if (!consumer) reject("Consumer not found to rent service");
            //Rent new service
            await this.rentService(consumer);
        } catch (e) {
            console.log(e);
        }
    })
});