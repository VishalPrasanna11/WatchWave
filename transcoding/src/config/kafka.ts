import { 
    Kafka, 
    Producer, 
    Consumer, 
    EachMessagePayload, 
    KafkaMessage,
    ProducerRecord,
    ConsumerConfig,
    KafkaConfig as KafkaJSConfig
} from 'kafkajs';
import fs from 'fs';
import path from 'path';

interface Message {
    key?: string;
    value: string;
}

class KafkaConfig {
    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;
    private isConnected: boolean = false;

    constructor(groupId: string = 'transcode-group') {
        const config: KafkaJSConfig = {
            clientId: 'youtube-uploader',
            brokers: ['localhost:9092'],
            connectionTimeout: 10000,
            requestTimeout: 30000,
            retry: {
                initialRetryTime: 100,
                retries: 8,
                maxRetryTime: 30000,
                factor: 2,
                multiplier: 1.5,
            },
            // Uncomment if using SSL and SASL
            // ssl: {
            //     ca: [fs.readFileSync(path.resolve('./ca.pem'), 'utf-8')]
            // },
            // sasl: {
            //     username: 'avnadmin',
            //     password: '<pwd>',
            //     mechanism: 'plain'
            // }
        };

        this.kafka = new Kafka(config);

        const producerConfig = {
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
        };

        const consumerConfig: ConsumerConfig = {
            groupId,
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            rebalanceTimeout: 60000,
            maxWaitTimeInMs: 5000,
            retry: {
                initialRetryTime: 100,
                retries: 8,
                maxRetryTime: 30000,
                factor: 2,
                multiplier: 1.5,
            }
        };

        this.producer = this.kafka.producer(producerConfig);
        this.consumer = this.kafka.consumer(consumerConfig);

        // Setup event handlers
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.producer.on('producer.disconnect', async () => {
            console.log('Producer disconnected. Attempting to reconnect...');
            this.isConnected = false;
            await this.reconnectProducer();
        });

        this.consumer.on('consumer.disconnect', async () => {
            console.log('Consumer disconnected. Attempting to reconnect...');
            this.isConnected = false;
            await this.reconnectConsumer();
        });

        // Handle consumer group errors
        this.consumer.on('consumer.group_join', () => {
            console.log('Consumer joined group successfully');
        });

        this.consumer.on('consumer.crash', async (error) => {
            console.error('Consumer crashed:', error);
            await this.reconnectConsumer();
        });
    }

    private async reconnectProducer(): Promise<void> {
        try {
            if (!this.isConnected) {
                await this.producer.connect();
                this.isConnected = true;
                console.log('Producer reconnected successfully');
            }
        } catch (error) {
            console.error('Failed to reconnect producer:', error);
            // Implement exponential backoff here if needed
            setTimeout(() => this.reconnectProducer(), 5000);
        }
    }

    private async reconnectConsumer(): Promise<void> {
        try {
            if (!this.isConnected) {
                await this.consumer.connect();
                this.isConnected = true;
                console.log('Consumer reconnected successfully');
                // Resubscribe to topics if necessary
                // Note: You might want to store active subscriptions somewhere
            }
        } catch (error) {
            console.error('Failed to reconnect consumer:', error);
            setTimeout(() => this.reconnectConsumer(), 5000);
        }
    }

    async produce(topic: string, messages: Message[]): Promise<void> {
        try {
            if (!this.isConnected) {
                await this.producer.connect();
                this.isConnected = true;
                console.log('Kafka producer connected...');
            }

            const producerRecord: ProducerRecord = {
                topic,
                messages: messages.map(msg => ({
                    key: msg.key,
                    value: msg.value
                }))
            };

            await this.producer.send(producerRecord);
            console.log('Messages sent to topic:', topic);
        } catch (error) {
            console.error('Error producing message:', error);
            throw error; // Allow caller to handle the error
        }
    }

    async consume(topic: string, callback: (value: string) => Promise<void>): Promise<void> {
        try {
            if (!this.isConnected) {
                await this.consumer.connect();
                this.isConnected = true;
                console.log('Kafka consumer connected...');
            }

            await this.consumer.subscribe({ 
                topic, 
                fromBeginning: false 
            });

            await this.consumer.run({
                autoCommit: true,
                autoCommitInterval: 5000,
                autoCommitThreshold: 100,
                eachMessage: async (payload: EachMessagePayload) => {
                    try {
                        const value = payload.message.value?.toString() || '';
                        await callback(value);
                    } catch (error) {
                        console.error('Error processing message:', error);
                        // Implement your error handling strategy here
                        // You might want to:
                        // 1. Skip the message
                        // 2. Retry processing
                        // 3. Send to a dead letter queue
                        // 4. Alert monitoring systems
                    }
                }
            });
        } catch (error) {
            console.error('Error consuming messages:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.producer.disconnect();
            await this.consumer.disconnect();
            this.isConnected = false;
            console.log('Disconnected from Kafka');
        } catch (error) {
            console.error('Error during disconnect:', error);
            throw error;
        }
    }
}

export default KafkaConfig;