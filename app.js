// const {mongoose} = require('mongoose');
// const {MongoMemoryServer} = require('mongodb-memory-server');
//
// MongoMemoryServer.create()
//     .then((mongoServer) => {
//         mongoose.connect(mongoServer.getUri(), {dbName: "test"})
//             .then(() => {
//                 console.log("Connected to database");
//             }).catch((e) => {
//             console.log(e);
//         });
//     }).catch((e) => {
//     console.log(e);
// });
const config = require('./config.json');
const {mongoose} = require('mongoose');

const sinon = require('sinon');
const clock = sinon.useFakeTimers();

const serviceAccount = require('./services/Account');
const serviceConsumer = require('./services/Consumer');
const serviceProvider = require('./services/Provider');
const serviceOfferDirect = require('./services/OfferDirect');
const serviceService = require('./services/Service');

mongoose.connect(config.db.url, {dbName: config.db.name})
    .then(async () => {
        console.log("Connected to database");
        //Drop account collection
        await serviceAccount.Account.deleteMany();
        await serviceConsumer.Consumer.deleteMany();
        await serviceService.Service.deleteMany();
        await serviceProvider.Provider.deleteMany();
        await serviceOfferDirect.OfferDirect.deleteMany();

        let accountConsumer = await serviceAccount.create();
        let consumer = await serviceConsumer.create(accountConsumer);
        let accountProvider = await serviceAccount.create();
        let provider = await serviceProvider.create(accountProvider);
        let service = await serviceService.create(consumer);
        let offerDirect = await serviceOfferDirect.create(service, 10,new Date().getTime() + 3600);
        offerDirect = await serviceOfferDirect.send(offerDirect, provider);

        clock.tick(3599);
        console.log("pause")
        clock.tick(10);

    })
    .catch(err => {
        console.log(err);
    });
