import { Kafka, Producer } from 'kafkajs';

let producer: Producer;

const kafka = new Kafka({
  clientId: 'video-service',
  brokers: ['localhost:9092'],  // Adjust the broker list as necessary
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

export const getKafkaProducer = (): Producer => {
  if (!producer) {
    throw new Error('Kafka producer is not connected');
  }
  return producer;
};
