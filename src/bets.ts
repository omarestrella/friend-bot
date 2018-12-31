import { Message } from '@yamdbf/core';
import { Guild } from 'discord.js';
import extractUsers from './utils/extractUsers';
import client from './client';

type Bet = {
  id: string
  amount: number
  data: string
}

type StoredEvent = {
  name: string
  arbiter: string
  bets: Bet[]
}

function isValidDate(date: Date) {
  return date.toString().toLowerCase() === 'invalid date';
}

export async function getCurrentEvents(guild: Guild): Promise<StoredEvent[] | null> {
  const dataKey = `bets-${guild.id}`;
  const data = await client.storage.get(dataKey);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}

async function setCurrentEvents(events: StoredEvent[], guild: Guild): Promise<StoredEvent[]> {
  const dataKey = `bets-${guild.id}`;
  await client.storage.set(dataKey, JSON.stringify(events));
  return events;
}

async function storeNewEvent(event: StoredEvent, guild: Guild) {
  const dataKey = `bets-${guild.id}`;
  if (!await client.storage.exists(dataKey)) {
    return client.storage.set(dataKey, JSON.stringify([ event ]));
  }
  const data: StoredEvent[] = await client.storage.get(dataKey).then(data => JSON.parse(data));
  data.push(event);
  return client.storage.set(dataKey, JSON.stringify(data));
}

export async function placeBet(message: Message, eventName: string, amount: number, data: string): Promise<boolean> {
  const events = await getCurrentEvents(message.guild);
  const currentEvent = events.find(event => event.name === eventName);
  if (!currentEvent) {
    return false;
  }

  if (currentEvent.arbiter === message.author.id) {
    return false;
  }

  let currentUserBet = currentEvent.bets.find(bet => bet.id === message.author.id);
  if (!currentUserBet) {
    currentUserBet = {
      data,
      id: message.author.id,
      amount: 0
    };
  }

  currentUserBet.amount += amount;
  await setCurrentEvents(events, message.guild);

  return true;
}

export async function setupBettingEvent(message: Message, eventName: string) {
  const possibleMentions = extractUsers(message.mentions.users);
  if (possibleMentions.length === 0) {
    throw new Error('Could not find arbiter in mentions.');
  }

  const arbiter = possibleMentions[0];
  if (!arbiter) {
    throw new Error('Could not find arbiter in mentions.');
  }

  const events = await getCurrentEvents(message.guild);
  if (events && events.length > 0) {
    const possibleEvent = events.find(event => event.name === eventName);
    if (possibleEvent) {
      throw new Error('Cannnot create another event with the same name');
    }
  }

  const newEvent: StoredEvent = {
    name: eventName,
    arbiter: arbiter.id,
    bets: []
  };

  return storeNewEvent(newEvent, message.guild);
}

export async function endEvent(message: Message, event: StoredEvent) {
  const events = await getCurrentEvents(message.guild);
  const currentEvents = events.filter(storedEvent => storedEvent.name !== event.name);
  console.log('Removing event:', event);
  return await setCurrentEvents(currentEvents, message.guild);
}
