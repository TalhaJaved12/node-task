const amqp = require('amqplib');
const redis = require('redis');

const redisClient = redis.createClient({
    host: 'localhost',  
    port: 6379          
});

redisClient.on('error', function (err) {
    console.error('Redis Error: ' + err);
});

async function consumeTasks() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertQueue('task_queue', { durable: true });
    await channel.prefetch(1); // Process one task at a time
    await redisClient.connect()
    
    console.log("Worker node started. Waiting for tasks...");
    
    channel.consume('task_queue', async function (msg) {
      const task = JSON.parse(msg.content.toString());
      
      console.log("Received task:", task);

          // Simulate time-consuming task processing
          await new Promise(resolve => setTimeout(resolve, task.complexity * 1000));

          console.log("Task processed:", task);

          // Cache result in Redis
          try {
             redisClient.set(task.id, JSON.stringify({ id: task.id, result: 'Processed' }), (err, reply) => {
                  if (err) {
                      console.error('Redis SET Error:', err);
                  } else {
                      console.log('Cached result for task:', task.id);
                      // Acknowledge message only after successful caching
                      channel.ack(msg);
                  }
              });
          } catch (error) {
              console.error('Error while interacting with Redis:', error);
              // Handle Redis interaction error
          }
      });
  } catch (error) {
      console.error('RabbitMQ Error:', error);
      // Handle RabbitMQ connection/channel creation error
  }
}

consumeTasks();