let mongoose = require("mongoose");

let cmsSchema = mongoose.Schema({
	homepage: {
		headerTitle: {
			type: String,
			require: true,
		},
		headerSubtitle: {
			type: String,
			require: true,
		},
		// coverImage: {
		// 	type: Buffer,
		// 	imageType: String,
		// },
		announcementTitle: {
			type: String,
			require: true,
		},
		announcementSubtitle: {
			type: String,
			require: true,
		},
		eventTitle: {
			type: String,
			require: true,
		},
		eventButton: {
			type: String,
			require: true,
		},
	},
	event: {
		upcomingEventTitle: {
			type: String,
			require: true,
		},
		upcomingEventSubtitle: {
			type: String,
			require: true,
		},
		allEventTitle: {
			type: String,
			require: true,
		},
	},
	announcement: {
		allAnnouncementTitle: {
			type: String,
			require: true,
		},
	},
	resource: {
		resourceTitle: {
			type: String,
			require: true,
		},
	},
	aboutUs: {
		aboutUsMotive: {
			type: String,
			require: true,
		},
		leaderTitle: {
			type: String,
			require: true,
		},
		memberTitle: {
			type: String,
			require: true,
		},
	},
	footer: {
		emailTitle: {
			type: String,
			require: true,
		},
		emailSubtitle: {
			type: String,
			require: true,
		},
	},
});

module.exports = mongoose.model("CMS", cmsSchema);
