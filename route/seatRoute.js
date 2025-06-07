const express = require("express");
const {
  saveSeats,
  getSeatsByDate,
  getSeatsByBusIdAndDate,
  updateByBookingId,
} = require("../Controller/seatController.js");


const seatRouter = express.Router();


seatRouter.post("/saveSeats", saveSeats);
seatRouter.get("/getSeatsByDate", getSeatsByDate); // ?date=2025-06-10
seatRouter.get("/getSeatsByBusIdAndDate",getSeatsByBusIdAndDate); // ?busId=BUS123&date=2025-06-10
seatRouter.patch("/updateByBookingId/:bookingId",updateByBookingId);


module.exports = seatRouter;
