import { Kafka, Producer } from 'kafkajs';

let producer: Producer;

const kafka = new Kafka({
  clientId: 'video-service',
  brokers: ['localhost:9092'],
  connectionTimeout: 10000, // Adjust this as needed
  requestTimeout: 30000,
  retry: {
    retries: 5,
  },
});


export const connectKafkaProducer = async (): Promise<void> => {
  try {
    producer = kafka.producer();
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
  }
};

export const disconnectKafkaProducer = async (): Promise<void> => {
  try {
    await producer.disconnect();
    console.log('Kafka producer disconnected');
  } catch (error) {
    console.error('Error disconnecting Kafka producer:', error);
  }
};

export const getKafkaProducer = (): Producer => {
  if (!producer) {
    throw new Error('Kafka producer is not connected');
  }
  return producer;
};

export const sendMessage = async (topic: string, message: string): Promise<void> => {
  const producer = getKafkaProducer();
  try {
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
    console.log(`Message sent to topic ${topic}: ${message}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
