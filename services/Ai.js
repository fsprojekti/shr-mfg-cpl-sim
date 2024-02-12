const config = require("../config.json");
const logger = require("../utils/logger");
const OfferDirect = require("../models/OfferDirect");

const apiKey = config.OPENAI_API_KEY;

const gameInstructions = `
With the goal of achieving maximal profit and winning the game, apply optimal decision making to maximise the revenue of a warehouse.

Game rules / Problem statement

In this profit-based game, 4 warehouses (players) battle amongst each other to generate the highest amount of profit. The goal of the project is to act as one of these players and generate optimal decisions with regards to profit generation. Profit is defined by the amount of tokens a player manages to obtain. Players are unable to see the token balance of other players until the game ends.

The only way to obtain tokens is by storing packages. Packages periodically offer themselves to random players so that they can store them for a set amount of time. In return, players receive a reward in the form of tokens. Package offers consist of the following parameters: ID number, ExpiryTime, and OfferAmount (in tokens). All packages are of a uniform size, are stored for a uniform amount of time, and occupy 1 warehouse slot. Each warehouse is limited with 5 slots meaning they can store a maximum of 5 packages.

When a player receives an offer, he has the following choices:
Accept the given offer
Decline the offer

Offers can only be accepted by a player under the condition that the player has a free slot in his warehouse for the offered package. In return for storing a package, the player receives the offered amount of tokens as a reward.

Declining offers has no consequences for the players and lets the package know that the offered amount of tokens was too low. Packages will consider this when making a new offer, but it is not guaranteed that the next offer from the same package will be offered to the same player.

Package offers have an expiry date as to avoid being stuck during the decision phase for an indefinite amount of time.

The personal offer history is the only origin of information for players. Players can only evaluate the profitability of offers based on their personal history (past accepted and declined offers). Players have no insight into the token balance or offer history of other players.

Decision Epochs
Decisions are required to be made only when called upon i.e., when an offer is received.

State

The state space is defined by the following parameters:

Warehouse occupancy: how many of the players' 5 warehouse slots are occupied.
Private history: what is the OfferAmount of previously accepted or declined offers.
Current offer: what are the parameters of the currently offered package

The current state space will be offered to the agent every time he receives a new offer.

Input

The agent will be called upon when he receives a new offer. The input will consist of the state space and will be formatted in the following way:

s/t; i1 y/n, i2 y/n, … ix

s/t will represent the warehouse occupancy, s will represent the amount of packages currently stored (the amount of occupied storage spaces) and t will represent the total amount of storage spaces available.

i1, i2, … will represent past offer amounts in tokens in chronological order (with the first being the oldest) while the suffix will mark if the offer was accepted (Y) or declined (N).

The last offer amount will have no suffix and will represent the OfferAmount of the currently open offer that requires a decision.

Example: 1/5, 100y, 80n, 90 (1 of 5 storage spaces are occupied, the first offer had an OfferAmount of 100 and was accepted, the second offer had an OfferAmount of 80 and was declined, and the currently open offer has an OfferAmount of 90 and requires a decision).

Output

Based on the received current state (warehouse occupancy, private history, and current offer), the agent is required to make a decision regarding the current offer. The output should be formatted exclusively as either Y or N (without any disclaimer, discussion, or explanation). Y indicates that the current offer should be accepted while N indicates that the current offer should be declined.
Here is input string:
`;

const generatePromptString = async (offers, directOffer) => {
  const promptArray = offers.map((offer) => {
    const status = offer.status === "ACCEPTED" ? "Y" : "N";
    return `${offer.price}${status}`;
  });

  const promptString = promptArray.join(",").concat(`,${directOffer.price}`);
  return promptString;
};

exports.makeOfferDecisionWithChatGpt = async (provider, directOffer) => {
  const offers = await OfferDirect.find({
    buyer: provider.account.id,
  }).populate("");
  const promptString = await generatePromptString(offers, directOffer);

  const combinedPrompt = gameInstructions + promptString;

  const data = {
    model: "gpt-4",
    messages: [{ role: "user", content: combinedPrompt }],
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(
      `https://api.openai.com/v1/chat/completions`,
      options
    );
    if (!response.ok) {
      throw new Error(`API request failed with status code ${response.status}`);
    }

    const jsonResponse = await response.json();

    const textResponse = jsonResponse.choices[0].message.content.trim();

    if (textResponse === "Y") {
      return "accept";
    } else if (textResponse === "N") {
      return "reject";
    } else {
      logger.error("Response is not a clear true/false answer:", textResponse);
      return;
    }
  } catch (error) {
    logger.error("Error:", error);
  }
};
