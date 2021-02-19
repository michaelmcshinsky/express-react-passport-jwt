const express = require("express");
const mongoose = require("mongoose");
const config = require("./config/database");
const routes = require("./routes");
const { User } = require("./app/models");
const cors = require("cors");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

require("./config/passport")(User);

app.use(routes);

mongoose.connect(config.database);

app.listen(PORT, function () {
  console.log(`Server now listening on PORT ${PORT}!`);
});
