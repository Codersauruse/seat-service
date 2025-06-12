const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/mongodb.js");
const seatRouter = require("./route/seatRoute.js");
const startEureka = require("./eureka/client.js");
const RabbitMQ = require("./config/rabbitMQClient.js");
const { respondMessages } = require("./Service/messageService.js");
const rabbitmq = RabbitMQ.getClient();

dotenv.config();
const app = express();
const port = process.env.PORT || 8084;

connectDB();

//middleware

app.use(express.json());
app.use(cors());

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await rabbitmq.disconnect();
  process.exit(0);
});
//api endpoints

app.use("/api/seats", seatRouter);

app.listen(port, async () => {
  console.log(`heelooo ${port}`);
  startEureka();
  await respondMessages();
});
