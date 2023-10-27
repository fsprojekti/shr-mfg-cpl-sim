const DbLocal = require("db-local");
const config = require("../config.json");
const {Schema} = new DbLocal({path: config.db});

exports.Account = Schema("Accounts", {
    balance: {type: Number, default: 100},
})

