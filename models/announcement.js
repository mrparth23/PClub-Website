let mongoose = require("mongoose");

let announcementSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	isActive: {
		type: Boolean,
		default: false,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Announcement", announcementSchema);
