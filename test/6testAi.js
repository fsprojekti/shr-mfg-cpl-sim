/**
 * Test 6
 *
 * Number of consumers: 3
 * Number of providers: 3
 * Time of simulation: 10000000 units
 *
 * Provider random offerDirect response [accept/reject/expire]
 */

const config = require('../config.json');

const {mongoose} = require('mongoose');

const FakeTimers = require("@sinonjs/fake-timers");
const clock = FakeTimers.install();

const serviceAccount = require('../services/Account');
const serviceConsumer = require('../services/Consumer');
const serviceProvider = require('../services/Provider');
const serviceOfferDirect = require('../services/OfferDirect');
const serviceService = require('../services/Service');
const logger = require('../utils/logger');
const resultWriter = require('../utils/resultWriter');


const {promises} = require('../utils/events')
mongoose.connect(config.db.url).then(async () => {
    //Drop account collection
    try {
        resultWriter.deleteResultsFile();
        //Drop account collection
        await serviceAccount.Account.deleteMany({});
        await serviceConsumer.Consumer.deleteMany({});
        await serviceService.Service.deleteMany({});
        await serviceProvider.Provider.deleteMany({});
        await serviceOfferDirect.OfferDirect.deleteMany({});

        let consumer = await serviceConsumer.create(await serviceAccount.create());
        let consumer2 = await serviceConsumer.create(await serviceAccount.create());
        let consumer3 = await serviceConsumer.create(await serviceAccount.create());

        let provider = await serviceProvider.create(await serviceAccount.create());
        let provider2 = await serviceProvider.create(await serviceAccount.createAiPlayer());
        let provider3 = await serviceProvider.create(await serviceAccount.create());

        await serviceConsumer.rentService(consumer);
        await serviceConsumer.rentService(consumer2);
        await serviceConsumer.rentService(consumer3);

        for (let i = 0; i < 10000000; i++) {
            await clock.tickAsync(1);
            //Flush all promises in queue 
        }
        logger.silly('TEST TEST: ' + promises.length)
    } catch (e) {
        console.log(e);
    }

        // clock.tickAsync(3000);
});

