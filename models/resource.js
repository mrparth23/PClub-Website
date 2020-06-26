let mongoose = require("mongoose");

let resourceSchema = mongoose.Schema({
	title: {
		type: String,
		require: true,
	},
	tags: [
		{
			type: String,
		},
	],
	description: {
		type: String,
	},
	file: {
		fileBuffer: Buffer,
		fileType: String,
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

resourceSchema.virtual("getFile").get(function () {
	if (this.file != null) {
		return `data:${
			this.file.fileType
		};charset=utf-8;base64,${this.file.fileBuffer.toString("base64")}`;
	}
});

module.exports = mongoose.model("Resource", resourceSchema);
