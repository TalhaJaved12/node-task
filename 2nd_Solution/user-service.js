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
    await channel.assertQueue('user_queue', { durable: false });

    channel.consume('user_queue', (msg) => {
        const newUser = JSON.parse(msg.content.toString());
        console.log('Received new user:', newUser);
        // Process the new user (e.g., save to database)
        // Cache user data in Redis
        redisClient.set(newUser.id, JSON.stringify(newUser));
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});
