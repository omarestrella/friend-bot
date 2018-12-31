import { Command, CommandDecorators, Message } from '@yamdbf/core';

import { getCurrentEvents, placeBet, endEvent } from '../bets';
import { getUserData, setUserData } from '../utils/userData';
import { filterMentionsFromCommandArgs } from '../utils/messageParsing';
import extractUsers from '../utils/extractUsers';

export default class CustomCommand extends Command {
  public constructor() {
    super({
      name: 'resolve-event',
      desc: 'Resolve an event and disburse winnings to a user',
      usage: '<prefix>resolve-event <event name> <@user>'
    });
  }

  async action(message: Message, args: string[]) {
    const eventName = filterMentionsFromCommandArgs(args).join(' ');

    if (args.length < 2) {
      this.respond(message, 'Provide an event name and user that won.');
      return;
    }

    if (message.mentions.users.size !== 1)  {
      this.respond(message, 'Provide a user that won.');
      return;
    }

    const user = extractUsers(message.mentions.users)[0];

    const events = await getCurrentEvents(message.guild);
    if (!events) {
      return;
    }

    const eventToEnd = events.find(event => event.name === args[0]);
    if (!eventToEnd) {
      message.channel.send(`Event ${eventName} not found`);
      return;
    }

    await endEvent(message, eventToEnd);

    const totalKarma = eventToEnd.bets.reduce((total, bet) => total + bet.amount, 0);
    message.channel.send(`Awarding ${totalKarma} to ${user.username}`);

    const userData = await getUserData(user, message.guild);
    userData.karma += totalKarma;

    setUserData(user, message.guild, userData);

  }
}
