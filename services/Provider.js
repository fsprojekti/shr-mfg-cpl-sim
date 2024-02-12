const Provider = require('../models/Provider');

exports.Provider = Provider;

const serviceService = require("./Service");
const serviceConsumer = require("./Consumer");
const serviceAi = require("./Ai");
const logger = require('../utils/logger');
const resultWriter = require('../utils/resultWriter');

exports.create = (account) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceProvider.create() called with: accountId: " + account.id);
            //Reject if account not defined
            if (!account) throw ("Account not defined");
            let provider = new Provider({
                account: account._id,
            });
            await provider.save();
            logger.info("serviceProvider.create() created provider with providerId: " + provider.id);
            resolve(provider);
        } catch (e) {
            logger.error("serviceProvider.create() error: " + e);
            reject(e);
        }
    })
}


exports.offerDirectReceive = (offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceProvider.offerDirectReceived() called with offerDirect: " + offerDirect._id);
            //Reject if offer not defined
            if (!offerDirect) throw ("Offer not defined");
            //Reject if offer not in state MARKET
            if (offerDirect.state !== "MARKET") throw ("Offer not in state MARKET");
            //Get provider
            let provider = await Provider.findOne({account: offerDirect.buyer}).populate('account').exec();
            //Reject if provider not found
            if (!provider) throw ("Provider not found");

            const decision = provider.account.isAiAccount ? 
                await serviceAi.makeOfferDecisionWithChatGpt(provider, offerDirect) 
                : await decisionOfferDirect(provider, offerDirect);
            switch (decision) {
                case "accept":{
                    offerDirect = await serviceConsumer.offerDirectAccepted(offerDirect);
                    logger.silly("serviceProvider.offerDirectReceived() accepted offer direct: " + offerDirect.id);
                    //Get service
                    let service = await serviceService.Service.findById(offerDirect.service);
                    //Commence service
                    logger.silly("serviceProvider.offerDirectReceived() commence service: " + service.id);
                    await serviceService.commence(service);
                    logger.silly("serviceProvider.offerDirectReceived() commenced service: " + service.id);
                }
                    break;
                case "reject":{
                    offerDirect = await serviceConsumer.offerDirectRejected(offerDirect);
                    logger.silly("serviceProvider.offerDirectReceived() rejected offer direct: " + offerDirect._id);
                }
                    break;
                case "postpone":{
                    logger.silly("serviceProvider.offerDirectReceived() postponed offer direct: " + offerDirect._id);
                }
                    break;
            }
            resultWriter.appendToFile(offerDirect, decision, provider.account.isAiAccount)
            resolve(offerDirect);
        } catch (e) {
            logger.error("serviceProvider.offerDirectReceived() error: " + e);
            reject(e);
        }
    })
}


let decisionOfferDirect = (provider, offerDirect) => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.silly("serviceProvider.decisionOfferDirect() called with offerDirect: " + offerDirect._id);
            // Randomly accept or reject or postpone offer direct
            let random = Math.random();
            let decision = chooseOutcome(0.5, 0.5, 0.0);
            if (decision === "accept"){
                //Check the availability of the provider capacities
                //Get current number of services with state ACTIVE
                let count = await serviceService.Service.countDocuments({provider: provider._id, state: "ACTIVE"});
                if (count >= provider.servicesLimit) {
                    logger.silly("serviceProvider.decisionOfferDirect() provider capacity reached: " + provider._id);
                    decision = "reject";
                }
            }
            resolve(decision);
        } catch (e) {
            logger.error("serviceProvider.decisionOfferDirect() error: " + e);
            reject(e);
        }
    })
}

let chooseOutcome = (acceptProbability, rejectProbability, postponeProbability) => {
    // Ensure the sum of probabilities is 1
    if (acceptProbability + rejectProbability + postponeProbability !== 1) {
        return 'Error: Probabilities must sum up to 1';
    }

    // Generate a random number between 0 and 1
    const randomNumber = Math.random();

    // Determine the outcome based on the probabilities
    if (randomNumber < acceptProbability) {
        return 'accept';
    } else if (randomNumber < acceptProbability + rejectProbability) {
        return 'reject';
    } else {
        return 'postpone';
    }
}
