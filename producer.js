const amqp = require('amqplib');
const uuid = require('uuid');

async function produceTasks() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue('task_queue', { durable: true });

    setInterval(() => {
        const task = {
            id: uuid.v4(),
            complexity: Math.floor(Math.random() * 10) + 1 // Random complexity
        };

        channel.sendToQueue('task_queue', Buffer.from(JSON.stringify(task)), { persistent: true });
        console.log('Task sent:', task);
    }, 2000); // Send a task every 2 seconds
}

produceTasks();
