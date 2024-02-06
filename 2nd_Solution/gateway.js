const amqp = require('amqplib');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const sendToQueue = async (queueName, data) => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: false });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
        console.log(`Sent to queue ${queueName}:`, data);
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error:', error);
    }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Gateway is running on port  ${PORT}`);
});
