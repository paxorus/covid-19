const express = require("express");
const http = require("http");

const {readCsv} = require("./js/csv-io.js");
const Fs = require("fs");

const app = express();
const server = http.createServer(app);

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", function(req, res) {
	const data = readCsv("data/output/mortality-vs-pop-density.csv");
	const movingAverages = JSON.parse(Fs.readFileSync("data/output/mortality-vs-pop-density-trendlines.json"));
	const movingDelta = JSON.parse(Fs.readFileSync("data/output/red-vs-blue-trendlines.json"));
	res.render("pages/home", {data, movingAverages, movingDelta});
});

server.listen(app.get("port"), function() {
	console.log("Node app is running on port", app.get("port"));
});
