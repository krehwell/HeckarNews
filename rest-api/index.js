const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require('dotenv').config();
const config = require('./config');

/// REST-API CONFIG
const PORT = process.env.PORT || 5000

const app = express();


/// DB CONNECTION
const mongoString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@heckar-news.d3u83.mongodb.net/heckarnewsdb?retryWrites=true&w=majority`;

mongoose.connect(mongoString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

mongoose.connection.on("error", (error) => {
    if (process.env.NODE_ENV === "development") {
        console.log(error)
    }
});

mongoose.connection.on("open", () => {
    console.log("Connected to MongoDB database.")
});


/// REST-API CONFIG
app.use(helmet());

app.use(cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : config.productionWebsiteUrl,
    credentials: true
}));


/// PARSER
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());


/// ROUTES
app.get("/", (_, res) => res.send("rest-api is working, kel!")); // debugger

app.use(require("./routes/users/index.js"));
app.use(require("./routes/items/index.js"));
app.use(require("./routes/comments/index.js"));
app.use(require("./routes/moderation/index.js"));


/// RUN SERVER
app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
});
