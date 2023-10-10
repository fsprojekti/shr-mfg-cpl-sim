const Account = require('../models/Account');

exports.Account = Account;

exports.create = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = new Account({});
            await account.save();
            resolve(account);
        } catch (e) {
            reject(e);
        }
    })
}