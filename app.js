const config = require('./config.json');
const {mongoose} = require('mongoose');

var FakeTimers = require("@sinonjs/fake-timers");
const clock = FakeTimers.install();

const serviceAccount = require('./services/Account');
const serviceConsumer = require('./services/Consumer');
const serviceProvider = require('./services/Provider');
const serviceOfferDirect = require('./services/OfferDirect');
const serviceService = require('./services/Service');


mongoose.connect(config.db.url).then(async () => {
    //Drop account collection
    await serviceAccount.Account.deleteMany();
    await serviceConsumer.Consumer.deleteMany();
    await serviceService.Service.deleteMany();
    await serviceProvider.Provider.deleteMany();
    await serviceOfferDirect.OfferDirect.deleteMany();

    let consumer = await serviceConsumer.create(await serviceAccount.create());
    let provider = await serviceProvider.create(await serviceAccount.create());

    // await serviceConsumer.rentService(consumer);
    // clock.tickAsync(6000);

});


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

