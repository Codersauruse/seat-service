const amqp = require("amqplib");
const SEAT_REQUEST_QUEUE = "seat-request";
class RabbitMQ {
  static rabbitMQHost = "rabbitmq";
  static rabbitMQPort = 5672;
  static rabbitMQUser = "guest";
  static rabbitMQPass = "guest";
  connection = null;
  channel = null;

  static #instance = null;

  constructor() {
    if (RabbitMQ.#instance) {
      throw new Error("intstance already exists");
    }
    RabbitMQ.#instance = this;
  }
  static getClient() {
    if (!RabbitMQ.#instance) {
      this.#instance = new RabbitMQ();
    }
    return this.#instance;
  }

  async connect() {
    if (this.connection == null) {
      try {
        const connectionString = `amqp://${RabbitMQ.rabbitMQUser}:${RabbitMQ.rabbitMQPass}@${RabbitMQ.rabbitMQHost}:${RabbitMQ.rabbitMQPort}`;
        this.connection = await amqp.connect(connectionString);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(SEAT_REQUEST_QUEUE, { durable: true });
        await this.channel.prefetch(1); // Ensures only one unacknowledged message at a time per consumer

        this.connection.on("error", (err) =>
          console.error("AMQP connection error:", err)
        );
        this.connection.on("close", () =>
          console.log("AMQP connection closed")
        );

        console.log("Connected to RabbitMQ and queue asserted.");
      } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
        setTimeout(() => this.connect(), 10000);
      }
    }
  }
  disconnect = async () => {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log("Disconnected from RabbitMQ.");
    } catch (error) {
      console.error(" Error disconnecting:", error);
    }
  };
}

const rabbitmq = RabbitMQ.getClient();

module.exports = rabbitmq;
