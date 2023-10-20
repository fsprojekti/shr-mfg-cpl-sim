const Provider = require('../models/Provider');

exports.Provider = Provider;

const serviceService = require("./Service");
const serviceConsumer = require("./Consumer");

exports.create = (account) => {
    return new Promise(async (resolve, reject) => {
        try {
            //Reject if account not defined
            if (!account) reject("Account not defined");
            let provider = new Provider({
                idAccount: account._id,
            });
            await provider.save();
            resolve(provider);
        } catch (e) {
            reject(e);
        }
    })
}

const logger = require('../utils/logger');

exports.offerDirectReceived = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceProvider.offerDirectReceived() called with offerDirect: "+offerDirect._id);
            //Reject if offer not defined
            if (!offerDirect) reject("Offer not defined");
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") reject("Offer not in state MARKET");
            //Get provider
            let provider = await Provider.findOne({idAccount: offerDirect.idBuyer});
            //Reject if provider not found
            if (!provider) reject("Provider not found");
            //Get current number of services with state ACTIVE
            let count = await serviceService.Service.countDocuments({idProvider: provider._id, state: "ACTIVE"});
            logger.silly("serviceProvider.offerDirectReceived() number of active services: "+count);
            //Reject if count >= maxServices
            if (count >= provider.servicesLimit){
                logger.silly("serviceProvider.offerDirectReceived() reject offer direct: "+offerDirect._id);
                offerDirect = await serviceConsumer.offerDirectRejected(offerDirect);
                logger.silly("serviceProvider.offerDirectReceived() rejected offer direct: "+offerDirect._id);
            } else{
                logger.silly("serviceProvider.offerDirectReceived() accept offer direct: "+offerDirect._id);
                offerDirect = await serviceConsumer.offerDirectAccepted(offerDirect);
                logger.silly("serviceProvider.offerDirectReceived() accepted offer direct: "+offerDirect._id);
                //Get service
                let service = await serviceService.Service.findById(offerDirect.idService);
                //Commence service
                logger.silly("serviceProvider.offerDirectReceived() commence service: "+service._id);
                await serviceService.commence(service);
                logger.silly("serviceProvider.offerDirectReceived() commenced service: "+service._id);
            }
            resolve(offerDirect);
        } catch (e) {
            logger.error("serviceProvider.offerDirectReceived() error: "+e);
            reject(e);
        }
    })
}

