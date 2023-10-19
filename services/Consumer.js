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

                if (service.state === "MARKET") {
                    //Reject if last offer direct is in state MARKET
                    let offerDirect = await serviceOfferDirect.OfferDirect.findOne({idService: service._id});
                    if (offerDirect.state === "MARKET") reject("Last offer direct is in state MARKET");
                }
            } else {
                service = await serviceService.create(consumer);
            }
            // Calculate price
            let price = await clcOfferPrice(service);
            // Calculate expiry timestamp
            let expiryTimestamp = await clcOfferDuration(service) + Math.floor(Date.now() / 1000);
            // Calculate offer provider
            let provider = await clcOfferProvider(service);

            //Rent service
            let offerDirect = await serviceService.rent(service, price, expiryTimestamp, provider);
            resolve(offerDirect);
        } catch (e) {
            reject(e);
        }
    })
}

exports.offerDirectAccepted = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if offer not defined
            if (!offerDirect) reject("Offer not defined");
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") reject("Offer not in state MARKET");
            //Get account from offer direct
            let account = await serviceAccount.Account.findOne({_id: offerDirect.idAccountSeller});
            //Get consumer of service
            let consumer = await Consumer.findOne({_id: offerDirect.idBuyer});
            //Reject if consumer not found
            if (!consumer) reject("Consumer not found to rent service");
            //Change state of offer direct to ACCEPTED
            offerDirect.state = "ACCEPTED";
            await offerDirect.save();
            resolve(offerDirect);
        } catch (e) {
            reject(e);
        }
    })

}

exports.offerDirectRejected = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
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
            //Rent service again
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
//Service commenced
emitter.on('serviceCommenced', async (service) => {
    try {
        //Log event to console in yellow color add id of service and add timestamp in format YYYY-MM-DD HH:mm:ss at the beginning
        console.log("\x1b[33m%s\x1b[0m", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " serviceCommenced " + service._id);


    } catch (e) {
        console.log(e);
    }
});

//Service completed
emitter.on('serviceCompleted', (service) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Log event to console in yellow color add id of service and add timestamp in format YYYY-MM-DD HH:mm:ss at the beginning
            console.log("\x1b[33m%s\x1b[0m", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " serviceCompleted " + service._id);
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
            //Log event to console in yellow color add id of offer direct and add timestamp in format YYYY-MM-DD HH:mm:ss at the beginning
            console.log("\x1b[33m%s\x1b[0m", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " offerDirectExpired " + offerDirect._id);
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