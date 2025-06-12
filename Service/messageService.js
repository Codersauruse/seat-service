
const RabbitMQ = require("../config/rabbitMQClient.js");
const SEAT_REQUEST_QUEUE = "seat-request";
const Seat = require("../Models/Seat.js");
const Status = require("../Models/enum/Status.js");
const rabbitmq = RabbitMQ.getClient();

const consume = async () => {
  try {
    await rabbitmq.channel.consume(
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
          console.error("Error processing seat booking:", err);
          channel.nack(message, false, false); // Drop message if parsing/logic fails
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error starting consumer:", error);
    throw error;
  }
};

const processSeatBooking = async (bookingRequest) => {
  const newSeat = new Seat({
    bookingId: bookingRequest.BookingId,
    busId: bookingRequest.BusId,
    userId: bookingRequest.UserId,
    reservedSeats: bookingRequest.BookedSeats,
    numberOfSeats: bookingRequest.NumberOfSeats,
    status: Status.RESERVED,
    date: bookingRequest.Date,
  });

  await newSeat.save();
};

const respondMessages = async () => {
  try {
    await rabbitmq.connect();
    await consume();
  } catch (error) {
    console.error("Error in message response flow:", error);
  }
};

module.exports = { respondMessages };
