let mongoose = require("mongoose");

let eventSchema = mongoose.Schema({
	title: {
		type: String,
		required: false,
	},
	description: {
		type: String,
		required: false,
	},
	host: {
		type: String,
		required: false,
	},
	category: {
		type: String,
		required: false,
	},
	poster: {
		posterBuffer: Buffer,
		posterType: String,
	},
	images: [
		{
			imageBuffer: Buffer,
			imageType: String,
		},
	],
	eventDate: {
		type: Date,
		default: Date.now,
	},
	rsvpLink: {
		type: String,
		require: false,
	},
	rsvpDate: {
		type: Date,
		default: Date.now,
	},
	photoLink: {
		type: String,
		require: false,
	},
	isActive: {
		type: Boolean,
		default: false,
	},
	createdDate: {
		type: Date,
		default: Date.now,
	},
	modifiedDate: {
		type: Date,
		default: Date.now,
	},
});

eventSchema.virtual("getPoster").get(function () {
	if (this.poster != null) {
		return `data:${
			this.poster.posterType
		};charset=utf-8;base64,${this.poster.posterBuffer.toString("base64")}`;
	}
});

eventSchema.virtual("getImages").get(function () {
	if (this.images != null || this.images != []) {
		let imageArray = [];
		this.images.forEach((image) => {
			imageArray.push(
				`data:${
					image.imageType
				};charset=utf-8;base64,${image.imageBuffer.toString("base64")}`
			);
		});

		console.log("test");
		return imageArray;
	}
});

module.exports = mongoose.model("Event", eventSchema);
