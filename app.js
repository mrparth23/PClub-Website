var debug = require("debug")("pclub:server");
var http = require("http");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var methodOverride = require("method-override");

var dotenv = require("dotenv");
dotenv.config();

var mongoose = require("mongoose");

mongoose.connect(
	process.env.DB_CONNECT,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	(err) => {
		if (err) {
			console.log(err);
		} else {
			console.log("Connected to PClubWebsite");
		}
	}
);

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");

var app = express();

//Get port from environment and store in Express.
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

// Create HTTP server.
var server = http.createServer(app);

//Listen on provided port, on all network interfaces.
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

//Normalize a port into a number, string, or false.
function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

//Event listener for HTTP server "error" event.
function onError(error) {
	if (error.syscall !== "listen") {
		throw error;
	}

	var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
			break;
		default:
			throw error;
	}
}

//Event listener for HTTP server "listening" event.
function onListening() {
	var addr = server.address();
	var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
	debug("Listening on " + bind);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(
	bodyParser.json({
		limit: "50mb",
	})
);

app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		parameterLimit: 100000,
		extended: true,
	})
);

app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/users", usersRouter);

app.use("/assets", [
	express.static(__dirname + "/node_modules/jquery/dist/"),
	express.static(__dirname + "/node_modules/filepond/dist/"),
	express.static(
		__dirname + "/node_modules/filepond-plugin-file-encode/dist/"
	),
	express.static(
		__dirname + "/node_modules/filepond-plugin-image-preview/dist/"
	),
	express.static(
		__dirname + "/node_modules/filepond-plugin-image-resize/dist/"
	),
	express.static(
		__dirname + "/node_modules/filepond-plugin-media-preview/dist/"
	),
	express.static(__dirname + "/node_modules/filepond-plugin-get-file/dist/"),
	express.static(
		__dirname + "/node_modules/filepond-plugin-image-edit/dist/"
	),
	express.static(__dirname + "/node_modules/summernote/dist/"),
]);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
