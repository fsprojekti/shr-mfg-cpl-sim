const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

exports.appendToFile = (offer, status, isAi) => {
  const filename = "results.txt";
  const filepath = path.join(__dirname, filename);

  const newLine = `CONSUMER: ${offer.seller} PROVIDER: ${offer.buyer} PRICE: ${
    offer.price
  } STATUS: ${status} ${isAi ? " AI PLAYER" : ""}`;

  // Check if the file exists
  fs.access(filepath, fs.constants.F_OK, (err) => {
    let contentToWrite = newLine;

    // If the file exists, prepend a newline character
    if (!err) {
      contentToWrite = "\n" + newLine;
    }

    // Append data to the file
    fs.appendFile(filepath, contentToWrite, (error) => {
      if (error) {
        logger.error("Error appending to file:", error);
      } else {
        logger.silly(`Data appended to ${filename}`);
      }
    });
  });
};

exports.deleteResultsFile = () => {
  const filename = "results.txt";
  const filepath = path.join(__dirname, filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      logger.error(`Error deleting file ${filename}:`, err);
    } else {
      logger.info(`File ${filename} has been deleted`);
    }
  });
};
