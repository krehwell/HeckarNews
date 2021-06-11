const express = require("express")

const api = require("./api.js")

const authUser = require("../../middlewares/index.js").authUser

const app = express.Router()

/// MODERATION API ENDPOINT

module.exports = app
