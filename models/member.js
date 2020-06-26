let mongoose = require("mongoose");

let memberSchema = mongoose.Schema({
	name: {
		type: String,
		require: true,
	},
	description: {
		type: String,
		require: true,
	},
	role: {
		type: String,
		require: true,
	},
	photo: {
		photoBuffer: Buffer,
		photoType: String,
	},
	designation: {
		type: String,
		require: true,
	},
});

memberSchema.virtual("getPhoto").get(function () {
	if (this.photo != null) {
		console.log(this.photo);
		return `data:${
			this.photo.photoType
		};charset=utf-8;base64,${this.photo.photoBuffer.toString("base64")}`;
	}
});
module.exports = mongoose.model("Member", memberSchema);
