// const dummyImages = require("../dummyImages");
const axios = require("axios");
require("dotenv").config();
const predictionModel = require("../Models/Furnace.prediction.model");
const { BlobServiceClient } = require("@azure/storage-blob");

const azureConnection = async () => {
  const connStr = process.env.AZURE_CONNECTION_STRING;
  const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  const containerName = "mycontainer";
  const containerClient = blobServiceClient.getContainerClient(containerName);
  let blobs = containerClient.listBlobsFlat();
  let allblobs = [];
  for await (const blob of blobs) {
    console.log(blob.name);
    if (blob.name[0] == "p") {
      let x = blob.name.split("_");
      let date = x[1];
      let time = x[2].split(".")[0];
      allblobs.push({
        date,
        time,
        name: blob.name,
      });
    }
  }
  // allblobs.sort((a, b) => {
  //     let [yearA, monthA, dayA] = a.date;
  //     let [yearB, monthB, dayB] = b.date;
  //     let [hrsA, minA, secA] = a.time;
  //     let [hrsB, minB, secB] = b.time;
  //     if (yearA != yearB) return yearB - yearA;
  //     if (monthA != monthB) return monthB - monthA;
  //     if (dayA != dayB) return dayB - dayA;
  //     if (hrsA != hrsB) return hrsB - hrsA;
  //     if (minA != minB) return minB - minA;
  //     if (secA != secB) return secB - secA;
  //     return 0
  // })
  // console.log(allblobs);
  // console.log(latestBlobURL);
  await generateAnalysedImageData(allblobs[allblobs.length - 1]);
};

const generateAnalysedImageData = async (lastblob) => {
  //takes latest data as parameter and saves the complete details into mongo by calling the ML API
  let latestBlobURL = `https://may20.blob.core.windows.net/mycontainer/${lastblob.name}`;
  let check = await predictionModel.find({ image: latestBlobURL });
  if (check.length == 0) {
    let url = process.env.ML_API_URL;
    console.log(lastblob.name);
    let res = await axios({
      url: url,
      method: "post",
      headers: {
        "Prediction-Key": "b45f0bd014bc499caa66f3cb7d227b85",
        "Content-Type": "application/json",
      },
      data: { Url: latestBlobURL },
    });
    res = await res;
    res.data.image = latestBlobURL;
    res.data.date = lastblob.date;
    res.data.time = lastblob.time;
    let [case1, case2] = res.data.predictions;
    let finalTag = "";
    let tagProbability = 0;
    if (case1.probability > case2.probability) {
      tagProbability = case1.probability;
      finalTag = case1.tagName;
    } else {
      tagProbability = case2.probability;
      finalTag = case2.tagName;
    }
    // console.log(tagProbability);
    res.data.tag = finalTag;
    res.data.tagProbability = Math.floor(tagProbability * 100);
    // console.log(res.data.predictions[0], res.data.predictions[1]);
    const newPredictionObject = new predictionModel(res.data);
    await newPredictionObject.save();
  } else {
    console.log("No new image found");
  }
};

module.exports = { generateAnalysedImageData, azureConnection };
