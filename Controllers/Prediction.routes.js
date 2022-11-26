const express = require("express");
const predictionController = express.Router();

const predictionModel = require("../Models/Furnace.prediction.model");

predictionController.get("/", async (req, res) => {
    const data = await predictionModel.find();
    return res.status(200).send(data);
});

module.exports = predictionController;
