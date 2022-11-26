const mongoose = require("mongoose");

// const predictionObjectSchema = new mongoose.Schema({
//     probability: { type: Number, required: true },
//     tagId: { type: String, required: true },
//     tagName: { type: String, required: true }
// })

const predictionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    project: { type: String, required: true },
    iteration: { type: String, required: true },
    created: { type: String, required: true },
    predictions: [{
        probability: String,
        tagId: String,
        tagName: String
    }],
    image: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    tag: { type: String, required: true },
    tagProbability: { type: Number, required: true },
});

const predictionModel = mongoose.model("prediction", predictionSchema);

module.exports = predictionModel;