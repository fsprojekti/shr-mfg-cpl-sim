const config = require('./config.json');

const {mongoose} = require('mongoose');

const FakeTimers = require("@sinonjs/fake-timers");
const clock = FakeTimers.install();

const serviceAccount = require('./services/Account');
const serviceConsumer = require('./services/Consumer');
const serviceProvider = require('./services/Provider');
const serviceOfferDirect = require('./services/OfferDirect');
const serviceService = require('./services/Service');

const {promises} = require('./utils/events')
mongoose.connect(config.db.url).then(async () => {
    //Drop account collection
    try {
        //Drop account collection
        await serviceAccount.Account.deleteMany({});
        await serviceConsumer.Consumer.deleteMany({});
        await serviceService.Service.deleteMany({});
        await serviceProvider.Provider.deleteMany({});
        await serviceOfferDirect.OfferDirect.deleteMany({});

        let consumer = await serviceConsumer.create(await serviceAccount.create());
        let provider = await serviceProvider.create(await serviceAccount.create());

        await serviceConsumer.rentService(consumer);
        //
        for (let i = 0; i < 18000; i++) {
            await clock.tickAsync(1);
            //Flush all promises in queue
            await Promise.all(promises);

        }

        // clock.tickAsync(3000);


    } catch (e) {
        console.log(e);
    }
});
//
//
// //
// // clock.tick(5000);
// // clock.runAllAsync();
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
// //
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
// //
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
// // clock.tick(1000);
//

// const FakeTimers = require("@sinonjs/fake-timers");
// const clock = FakeTimers.install();
//
// const axios = require('axios');
//
// let promises=[]

// let fun = async () => {
//     setTimeout(async function () {
//         console.log(+new Date()+' Timer for 1000ms fired');
//         promises.push(axios.get('https://jsonplaceholder.typicode.com/todos/1'));
//         console.log(+new Date() + ' Response');
//     }, 1000);
//
//     setTimeout(function () {
//         console.log(+new Date()+' Timer for 2000ms fired');
//
//     }, 2000);
//
//     for (let i = 0; i < 3000; i++) {
//         await clock.tickAsync(1)
//         await Promise.all(promises);
//
//     }
// }
// fun();
