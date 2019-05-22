import { Message } from "@yamdbf/core";
import { User } from "discord.js";
import extractUsers from "./utils/extractUsers";
import { getUserData, setUserData } from "./utils/userData";
import { ERRORS } from "./utils/errors";

async function increaseKarma(sender: User, reciever: User, amount: number, message: Message) {
  console.log('Trying to add karma:', { from: sender.username, to: reciever.username });

  let senderData = await getUserData(sender, message.guild);
  let recieverData = await getUserData(reciever, message.guild);

  if (!recieverData) {
    recieverData = {
      karma: 0,
      karmaBank: 10,
      frozen: false
    };
  }

  if (recieverData.frozen) {
    throw Error(ERRORS.FROZEN_KARMA);
  }

  if (!senderData) {
    senderData = {
      karma: 0,
      karmaBank: 10,
      frozen: false
    };
  } else {
    if (senderData.karma === null || senderData.karma === undefined) {
      senderData.karma = 0;
    }
    if (senderData.karmaBank === null || senderData.karmaBank === undefined) {
      senderData.karmaBank = 10;
    }
  }

  if (senderData.karmaBank <= 0) {
    throw Error(ERRORS.EMPTY_BANK);
  }

  const sub = Math.min(senderData.karmaBank, amount);
  senderData.karmaBank -= sub;

  await setUserData(sender, message.guild, senderData);

  recieverData.karma += amount;
  recieverData.karmaBank += amount + 1;
  return setUserData(reciever, message.guild, recieverData)
}

export default function processKarma(message: Message) {
  if (!message.guild || !message.guild.available) {
    console.log('Karma can only be sent in guild server rooms');
    return;
  }

  const users = extractUsers(message.mentions.users);
  if (users.length !== 1) {
    return;
  }

  const author = message.author;
  const text = message.content;

  const matcher = /\+([1-5]{1})/;
  const match = text.match(matcher);
  if (!match || match.length <= 1) {
    return;
  }

  const [mentionedUser] = users;

  if (mentionedUser.id === author.id) {
    console.log('Cannot give karma to yourself:', mentionedUser.username);
    return;
  }

  const amount = parseInt(match[1], 10);
  if (isNaN(amount)) {
    console.log('Cannot parse karma number:', amount);
    return;
  }

  increaseKarma(author, mentionedUser, amount, message).then((data) => {
    message.channel.send(`${mentionedUser.username} now has ${data.karma} karma.`)
  }).catch((error: Error) => {
    if (error.message === ERRORS.EMPTY_BANK) {
      message.channel.send(`${author.username} has no karma in their bank.`);
    } else if (error.message === ERRORS.FROZEN_KARMA) {
      message.channel.send(`${mentionedUser.username}'s karma has been frozen.`);
    } else {
      console.error('Error processing karma:', error);
    }
  });
}
