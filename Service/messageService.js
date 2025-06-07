const amqp = require("amqplib");
const SEAT_REQUEST_QUEUE = "seat-request";
const Seat = require("../Models/Seat.js");
const Status = require("../Models/enum/Status.js");
let connection;
let channel;

const connect = async () => {

    try {
            const rabbitMQHost = "rabbitmq";
            const rabbitMQPort =  5672;
            const rabbitMQUser =  "guest";
            const rabbitMQPass =  "guest";
        // Connect to RabbitMQ - similar to .NET connection
        
        const connectionString = `amqp://${rabbitMQUser}:${rabbitMQPass}@${rabbitMQHost}:${rabbitMQPort}`;

       connection = await amqp.connect(connectionString);
       channel = await this.connection.createChannel();

      
      await this.channel.assertQueue(SEAT_REQUEST_QUEUE, {
        durable: true,
      });

      console.log(
        "Connected to RabbitMQ, waiting for seat booking messages..."
      );
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
      throw error;
    }
}




const consume = async () => {
    try {
        await channel.consume(SEAT_REQUEST_QUEUE,
       async (message) => {
            if (message) {
                try {
                        // Parse message - same as .NET consumer
                        const content = message.content.toString();
                        const bookingRequest = JSON.parse(content);

                        console.log('Seat booking request received:', {
                            bookingId: bookingRequest.BookingId,
                            seats: bookingRequest.SeatNumbers,
                            eventId: bookingRequest.EventId
                        });

                        // Process the booking
                        await processSeatBooking(bookingRequest);

                        // Acknowledge message - manual ack for reliability
                        channel.ack(message);
                        
                    } catch (error) {
                        console.error('Error processing seat booking:', error);
                        
                        // Reject message and don't requeue if it's a parsing error
                        channel.nack(message, false, false);
                    }
            }
        }
        );
    }
    catch (error) {
     console.error("Error starting consumer:", error);
     throw error;
    }
    

}

const processSeatBooking = async (bookingRequest) => {
    const newSeat = new Seat({
      bookingId: bookingRequest.BookingId,
      busId: bookingRequest.BusId,
      userId: bookingRequest.UserId,
      reservedSeats: bookingRequest.BookedSeats,
      numberOfseats: bookingRequest.NumberOfSeats,
      status: Status.RESERVED,
      date: bookingRequest.Date,
    });
    await newSeat.save();
    
};







const disconnect = async () => {

    try {
            if (channel) {
                channel.close();
            }
            if (connection) {
                await connection.close();
            }
            console.log('Disconnected from RabbitMQ');
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    }

