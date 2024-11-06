import express from 'express';
import cors from 'cors';
import "dotenv/config";
import s3ToS3 from './transcoder/s3toS3';
import { Kafka } from 'kafkajs'; // Import Kafka

const port = 8000;
const app = express();

app.use(cors({
    origin: '*',
    allowedHeaders: '*'
}));

app.use(express.json());

// Kafka setup
const kafka = new Kafka({
    clientId: 'video-service',
    brokers: ['localhost:9092'], // Adjust the broker list as necessary
});

const consumer = kafka.consumer({ groupId: 'transcode-group' });
const producer = kafka.producer(); // Create a Kafka producer

// Function to start the Kafka consumer
const startKafkaConsumer = async () => {
    try {
        await consumer.connect();
        console.log('Kafka consumer connected');

        // Subscribe to the topic
        await consumer.subscribe({ topic: 'watchwave-video-upload', fromBeginning: true });

        // Run the consumer
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value?.toString();
                console.log('-'.repeat(50));
                console.log(`Received message: ${value}`);

                // Parse the message and trigger video processing
                if (value) {
                    try {
                        const { videoId, videoUrl } = JSON.parse(value);
                        await startVideoTranscoding(videoId, videoUrl); // Pass the video ID and URL to the transcoding function
                    } catch (error) {
                        console.error('Error processing message:', error);
                    }
                }
            },
        });
    } catch (error) {
        console.error('Error starting Kafka consumer:', error);
    }
};

// Function to start video transcoding and produce master URL
async function startVideoTranscoding(videoId: string, videoUrl: string) {
    try {
        console.log('Starting video processing...');
        
        // Process the video and get the master URL
        const masterUrl = await s3ToS3(videoUrl); // Assuming this returns the master URL
        console.log('Master URL:', masterUrl);

        // Produce the master URL to a specific Kafka topic
        sendMasterUrl(videoId, masterUrl);

        console.log('Video processing completed successfully.');
    } catch (error) {
        console.error('Error during video processing:', error);
    }
}

//Function to send master URL to a Kafka topic
const sendMasterUrl = async (videoId: string, masterUrl: string) => {
    try {
        let videoUrl = masterUrl;

        const message = JSON.stringify({ videoId, videoUrl });

        await producer.send({
            topic: 'new-master-url', // Change to your desired topic for master URLs
            messages: [{ value: message }],
        });

        console.log(`Master URL sent to topic 'new-master-url': ${masterUrl}`);
    } catch (error) {
        console.error('Error sending master URL:', error);
    }
};

//Start the producer once when the server starts
const startProducer = async () => {
    try {
        await producer.connect();
        console.log('Kafka producer connected');
    } catch (error) {
        console.error('Error starting Kafka producer:', error);
    }
};

// Define routes
app.get('/', (req, res) => {
    res.send('HHLD YouTube service transcoder');
});

// Start the server
app.listen(port, async () => {
    console.log(`Server is listening at http://localhost:${port}`);
    await startProducer(); // Start the Kafka producer
    await startKafkaConsumer(); // Start the Kafka consumer
});

// Ensure to disconnect the producer and consumer when shutting down
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
        await consumer.disconnect();
        await producer.disconnect();
        console.log('Kafka consumer and producer disconnected');
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
    process.exit(0);
});
