let mongoose = require("mongoose");

let emailSchema = mongoose.Schema({
	email: {
		type: String,
		require: true,
	},
});

module.exports = mongoose.model("Email", emailSchema);
