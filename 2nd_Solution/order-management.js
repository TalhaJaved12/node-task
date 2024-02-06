const amqp = require('amqplib');
const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');

const app = express();
app.use(bodyParser.json());

const redisClient = redis.createClient({
    host: 'localhost',  // Redis server host
    port: 6379          // Redis server port
});

redisClient.on('error', function (err) {
    console.error('Redis Error: ' + err);
});

const handleMessage = async (channel) => {
    await channel.assertQueue('order_queue', { durable: false });

    channel.consume('order_queue', (msg) => {
        const newOrder = JSON.parse(msg.content.toString());
        console.log('Received new order:', newOrder);
        // Process the new order (e.g., save to database)
        // Cache order data in Redis
        redisClient.set(newOrder.id, JSON.stringify(newOrder));
        channel.ack(msg);
    });
};

const start = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await handleMessage(channel);
    } catch (error) {
        console.error('Error:', error);
    }
};

start();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Order service is running on port ${PORT}`);
});
