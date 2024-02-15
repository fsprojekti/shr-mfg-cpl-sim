const config = require('../config.json');

const {mongoose} = require('mongoose');
const serviceConsumer = require("../services/Consumer");
const serviceService = require("../services/Service");


mongoose.connect(config.db.url).then(async () => {
    //Analyse consumers
    let consumers = await serviceConsumer.Consumer.find({});
    //Write to console in blue number of consumers
    console.log("\x1b[34m", "CONSUMERS");
    console.log("\x1b[34m", "Number of consumers: " + consumers.length);
    for(let consumer of consumers){
        //Gather consumer services
        let services = await serviceService.Service.find({seller: consumer.account});
        //Write in blue consumer index  and number of services
        console.log("\x1b[34m", "Consumer: " + consumer.account + " had " + services.length + " services");
        //Calculate total costs of services for consumer and average cost
        let totalCost = 0;
        for(let service of services){
            //Find last
            totalCost += service.price;
        }
        //Write in blue total cost and average cost
        console.log("\x1b[34m", "Total cost: " + totalCost + " Average cost: " + totalCost/services.length);
    }
});
