const config = require('./config.json');
const clock = require('./utils/clock');

const serviceAccount = require('./services/Account');
const serviceConsumer = require('./services/Consumer');
const serviceProvider = require('./services/Provider');
const serviceOfferDirect = require('./services/OfferDirect');
const serviceService = require('./services/Service');

const run = async () => {
    //Drop account collection
    serviceAccount.Account.remove({});
    serviceConsumer.Consumer.remove({});
    serviceService.Service.remove({});
    serviceProvider.Provider.remove({});
    serviceOfferDirect.OfferDirect.remove({});

    let consumer = await serviceConsumer.create(await serviceAccount.create());
    let provider = await serviceProvider.create(await serviceAccount.create());

    await serviceConsumer.rentService(consumer);
    //
    for (let i = 0; i < 6000; i++) {
        clock.tick(1);
    //     //await clock.runAllAsync();
    }
}

run();


//
// clock.tick(5000);
// clock.runAllAsync();
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);
//
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);
//
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);
// clock.tick(1000);

