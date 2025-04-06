import { Queue } from 'distube';

export default async (queue: Queue) => {
    try {
        queue.voice.leave();
    } catch (error) {
        console.error(error);
    }
}
