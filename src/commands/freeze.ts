import { Command, CommandDecorators, Message } from '@yamdbf/core';

import extractUsers from '../utils/extractUsers';
import { getUserData, setUserData } from '../utils/userData';
import { User } from 'discord.js';

export default class KarmaCommand extends Command {
  public constructor() {
    super({
      name: 'freeze',
      desc: 'Freeze a user\'s karma',
      usage: '<prefix>freeze <username>',
      ownerOnly: true
    });
  }

  async action(message: Message, args: string[]) {
    console.debug('Attempting to freeze user...', args);

    let user: User = null;
    if (message.mentions.users.size > 0) {
      user = extractUsers(message.mentions.users)[0];
    } else if (args) {
      // Might have just typed a name...
      const members = message.guild && message.guild.members;
      const possibleMember = members.find(member => {
        return member.displayName === args.join(' ');
      });
      if (possibleMember) {
        user = possibleMember.user;
      }
    }

    if (user) {
      const data = await getUserData(user, message.guild);
      data.frozen = !data.frozen;
      await setUserData(user, message.guild, data);
      if (data.frozen) {
        message.channel.send(`${user.username}'s karma has been frozen.`);
      } else {
        message.channel.send(`${user.username}'s karma has been unfrozen.`);
      }
    }
  }
}
