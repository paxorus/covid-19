const express = require("express");
const http = require("http");

const {readCsv} = require("./csv-io.js");

const app = express();
const server = http.createServer(app);

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", function(req, res) {
	const data = readCsv("data/boop.csv");
	res.render("pages/home", {data});
});

server.listen(app.get("port"), function() {
	console.log("Node app is running on port", app.get("port"));
});
