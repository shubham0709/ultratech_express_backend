const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());

const { connection } = require("./Config/config");
const predictionModel = require("./Models/Furnace.prediction.model");

const cors = require("cors");
const { azureConnection } = require("./Functions/utility.functions");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.enable("trust proxy");
app.use(cors(corsOptions));

app.get("/", async (req, res) => {
  const data = await predictionModel.find();
  return res.status(200).send(data);
});

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("database connected!!");
  } catch (err) {
    console.log(err);
  }
  console.log("Listening on port " + process.env.PORT);
  setInterval(() => {
    azureConnection();
  }, 30000);
});
