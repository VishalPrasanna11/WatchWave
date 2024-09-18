import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";

class KafkaConfig {
    kafka: Kafka;
    producer: any;
    consumer: any;

    constructor() {
        this.kafka = new Kafka({
            clientId: "youtube-uploader",
            brokers: ["<broker-url>"],
            ssl: {
                ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")]
            },
            sasl: {
                username: "avnadmin",
                password: "<pwd>",
                mechanism: "plain"
            }
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: "youtube-uploader" });
    }

    async produce(topic: string, messages: any[]) {
        try {
            await this.producer.connect();
            console.log("Kafka connected...");
            await this.producer.send({ topic, messages });
        } catch (error) {
            console.log(error);
        } finally {
            await this.producer.disconnect();
        }
    }

    async consume(topic: string, callback: (value: string) => void) {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topic, fromBeginning: true });
            await this.consumer.run({
                eachMessage: async ({ message }: { message: any }) => {
                    const value = message.value?.toString() || '';
                    callback(value);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
}

export default KafkaConfig;
