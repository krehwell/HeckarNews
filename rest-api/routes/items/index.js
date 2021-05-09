const express = require("express");
const app = express.Router();

const api = require("./api.js");
const authUser = require("../../middlewares/index.js").authUser;

// API ENDPOINT CODE WILL GO HERE

module.exports = app;
