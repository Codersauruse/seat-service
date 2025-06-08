const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/mongodb.js");
const seatRouter = require("./route/seatRoute.js");
const startEureka = require("./eureka/client.js");
const { respondMessages, disconnect } = require("./Service/messageService.js");

dotenv.config();
const app = express();
const port = process.env.PORT || 8084;

connectDB();

//middleware

app.use(express.json());
app.use(cors());

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await disconnect();
  process.exit(0);
});
//api endpoints

app.use("/api/seats", seatRouter);

app.listen(port, async () => {
  console.log(`heelooo ${port}`);
  startEureka();
  await respondMessages();
});
