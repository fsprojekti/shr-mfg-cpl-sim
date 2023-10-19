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

exports.offerDirectReceived = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
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
            //Reject if count >= maxServices
            if (count >= provider.servicesLimit){
                offerDirect = await serviceConsumer.offerDirectRejected(offerDirect);
            } else{
                offerDirect = await serviceConsumer.offerDirectAccepted(offerDirect);
                //Get service
                let service = serviceService.Service.findById(offerDirect.idService);
                //Commence service
                await serviceService.commence(service);
            }
            resolve(offerDirect);
        } catch (e) {
            reject(e);
        }
    })
}

