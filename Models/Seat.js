const mongoose = require("mongoose");
const Status = require("./enum/Status");

const seatSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  bookingId: { type: Number, required: true },
  userId: { type: Number, required: true },
  reservedSeats: { type: [int], required: true },
  numberOfseats:{type:Number},
  status: {
    type: String,
    enum: Object.values(SeatStatus),
    default: Status.AVAILABLE,
  },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Seat", seatSchema);
