const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/mongodb");
const seatRouter = require("./route/seatRoute");
const startEureka = require("./eureka/client");

dotenv.config();
const app = express();
const port = process.env.PORT || 8084;

connectDB();

//middleware

app.use(express.json());
app.use(cors());

//api endpoints

app.use("/api/seats", seatRouter);

app.listen(port, () => {
  console.log(`heelooo ${port}`);
  startEureka();
});
