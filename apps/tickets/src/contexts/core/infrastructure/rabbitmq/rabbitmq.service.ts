import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, ChannelModel, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly exchangeName = 'domain_events';
  private readonly exchangeType = 'topic';

  async onModuleInit() {
    await this.connect();
  }

  async connect(): Promise<void> {
    try {
      const uri = process.env.RABBITMQ_URI || 'amqp://guest:guest@rabbitmq:5672/';
      this.connection = await connect(uri);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
        durable: true,
      });

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Error connecting to RabbitMQ', error);
      throw error;
    }
  }

  async subscribe(routingKey: string, handler: (message: any) => void): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const queueName = `tickets.${routingKey}`;
    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, this.exchangeName, routingKey);

    this.logger.log(`Subscribed to ${routingKey} on queue ${queueName}`);

    await this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          this.channel?.ack(msg);
        } catch (error) {
          this.logger.error(`Error processing message from ${routingKey}`, error);
          this.channel?.nack(msg, false, false);
        }
      }
    });
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
