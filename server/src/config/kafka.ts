import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

export const kafka = new Kafka({
  clientId: 'flashseat-backend',
  brokers: [KAFKA_BROKER],
});

export const producer = kafka.producer();

export const connectKafka = async (): Promise<void> => {
  try {
    await producer.connect();
    console.log('📢 Kafka Producer Connected successfully.');
  } catch (error) {
    console.error('❌ Kafka Connection Error:', error);
  }
};
