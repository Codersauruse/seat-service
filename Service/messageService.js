const amqp = require("amqplib");
const SEAT_REQUEST_QUEUE = "seat-request";
const Seat = require("../Models/Seat.js");
const Status = require("../Models/enum/Status.js");
let connection;
let channel;

const connect = async () => {
  try {
    const rabbitMQHost = "rabbitmq";
    const rabbitMQPort = 5672;
    const rabbitMQUser = "guest";
    const rabbitMQPass = "guest";
    const connectionString = `amqp://${rabbitMQUser}:${rabbitMQPass}@${rabbitMQHost}:${rabbitMQPort}`;

    connection = await amqp.connect(connectionString);
    channel = await connection.createChannel();

    await channel.assertQueue(SEAT_REQUEST_QUEUE, { durable: true });
    await channel.prefetch(1); // Ensures only one unacknowledged message at a time per consumer

    connection.on("error", (err) =>
      console.error("AMQP connection error:", err)
    );
    connection.on("close", () => console.log("AMQP connection closed"));

    console.log("✅ Connected to RabbitMQ and queue asserted.");
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
    throw error;
  }
};

const consume = async () => {
  try {
    await channel.consume(
      SEAT_REQUEST_QUEUE,
      async (message) => {
        if (!message) return;

        try {
          const content = message.content.toString();
          const bookingRequest = JSON.parse(content);

          console.log("📩 Seat booking request received:", {
            bookingId: bookingRequest.BookingId,
            seats: bookingRequest.SeatNumbers,
            busId: bookingRequest.BusId,
          });

          await processSeatBooking(bookingRequest);
          channel.ack(message);
        } catch (err) {
          console.error("❌ Error processing seat booking:", err);
          channel.nack(message, false, false); // Drop message if parsing/logic fails
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Error starting consumer:", error);
    throw error;
  }
};

const processSeatBooking = async (bookingRequest) => {
  const newSeat = new Seat({
    bookingId: bookingRequest.BookingId,
    busId: bookingRequest.BusId,
    userId: bookingRequest.UserId,
    reservedSeats: bookingRequest.SeatNumbers,
    numberOfSeats: bookingRequest.NumberOfSeats,
    status: Status.RESERVED,
    date: bookingRequest.Date,
  });

  await newSeat.save();
};

const disconnect = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("🚪 Disconnected from RabbitMQ.");
  } catch (error) {
    console.error("❌ Error disconnecting:", error);
  }
};

const respondMessages = async () => {
  try {
    await connect();
    await consume();
  } catch (error) {
    console.error("❌ Error in message response flow:", error);
  }
};

module.exports = { respondMessages, disconnect };
