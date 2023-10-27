const {Account} = require('../models/Account');

exports.Account = Account;

exports.create = () => {
    return new Promise((resolve, reject) => {
        try {
            let account = Account.create({}).save();
            resolve(account);
        } catch (e) {
            reject(e);
        }
    })
}