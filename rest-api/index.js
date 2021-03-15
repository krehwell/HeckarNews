const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

/// REST-API CONFIG
const PORT = process.env.PORT || 5000

const app = express();

/// DB CONNECTION


/// REST-API CONFIG
app.use(helmet());

app.use(cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3000" : /domain\.com$/,
    credentials: true
}));


// PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());


/// ROUTES
app.get("/", (_, res) => {
    res.send("rest-api is working, kel!");
});


/// RUN SERVER
app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`);
});
