const Account = require('../models/Account');

exports.Account = Account;

const logger = require('../utils/logger');

exports.create = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = new Account({});
            await account.save();
            logger.info("accountService.create() created account: " + account.id);
            resolve(account);
        } catch (e) {
            reject(e);
        }
    });
}

exports.createAiPlayer = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = new Account({isAiAccount: true});
            await account.save();
            logger.info("accountService.createAiPlayer() created AI account: " + account.id);
            resolve(account);
        } catch (e) {
            reject(e);
        }
    });
}