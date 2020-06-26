let mongoose = require("mongoose");

let adminSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		required: true,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Admin", adminSchema);
