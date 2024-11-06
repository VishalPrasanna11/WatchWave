import { Kafka, Consumer } from 'kafkajs';
import Video from '../models/Video'; // Adjust the import as necessary

const kafka = new Kafka({
    clientId: 'video-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'video-group' }); // Define a consumer group

// Function to start the Kafka consumer
export const startKafkaConsumer = async () => {
    await consumer.connect();
    console.log('Kafka consumer connected');

    // Subscribe to the topic
    await consumer.subscribe({ topic: 'new-master-url', fromBeginning: true });

    // Run the consumer
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const value = message.value?.toString();
            console.log('-'.repeat(50));
            console.log(`Received message: ${value}`);

            // Parse the message and update the video URL in the database
            if (value) {
                const { videoId, videoUrl } = JSON.parse(value);
                console.log(`this is from India`);
                console.log(videoId);
                console.log(videoUrl);

                await updateVideoUrl(videoId, videoUrl); // Update video URL
            }
        },
    });
};

// Function to update the video URL in the database
const updateVideoUrl = async (videoId: string, videoUrl: string) => {
    try {
        await Video.update(
            { videoUrl }, // Set the new video URL
            { where: { videoId } }
        );
        console.log(`Video URL updated for videoId ${videoId}: ${videoUrl}`);
    } catch (error) {
        console.error(`Error updating video URL for videoId ${videoId}:`, error);
    }
};

// Start the consumer when the application starts

