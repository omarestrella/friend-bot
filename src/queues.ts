import * as Queue from 'bull';

const queues: { [index: string]: Queue.Queue } = {};

function logger(job: Queue.Job) {
  console.log(`Job with id ${job.id} has completed.`);
}

export function startQueues() {
  const bettingQueue = new Queue('bets', 'redis://127.0.0.1:6379', {
    limiter: {
      max: 1,
      duration: 5000
    }
  });

  Object.assign(queues, {
    betting: bettingQueue
  });

  Object.keys(queues).forEach(key => {
    const queue = queues[key];
    queue.on('completed', logger);
  });
}

export default queues;
