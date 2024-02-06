const amqp = require('amqplib');
const redis = require('redis');

const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379        
});

redisClient.on('error', function (err) {
    console.error('Redis Error: ' + err);
});

async function processResults() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await redisClient.connect();

        const resultQueue = await channel.assertQueue('', { exclusive: true });
        const resultQueueName = resultQueue.queue;

        await channel.bindQueue(resultQueueName, '', resultQueueName);

        console.log("Supervisor started. Waiting for results...");

        channel.consume(resultQueueName, async function (msg) {
            const result = JSON.parse(msg.content.toString());

            console.log("Received result:", result);

            // Process result or store it in database

            channel.ack(msg);
        });
    } catch (error) {
        console.error('RabbitMQ Error:', error);
        // Handle RabbitMQ connection/channel creation error
    }
}

processResults();
