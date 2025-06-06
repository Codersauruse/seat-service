const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const port = process.env.PORT || 8084;

//middleware

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`heelooo ${port}`);
});
