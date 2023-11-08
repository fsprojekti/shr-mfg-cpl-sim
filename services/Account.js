const Account = require('../models/Account');

exports.Account = Account;

exports.create = async () => {
    try {
        let account = new Account({});
        await account.save();
        return account;
    } catch (e) {
        throw e;
    }
}