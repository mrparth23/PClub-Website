var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");

//  Models
var Admin = require("./../models/admin");
var Announcement = require("./../models/announcement");
var CMS = require("./../models/cms");
var Event = require("./../models/event");
var Resource = require("./../models/resource");
var Member = require("./../models/member");
const Email = require("./../models/email");

var imageMimeTypes = ["image/png", "image/jpg", "image/jpeg"];

var user;

// // // // //
// Authentication
// // // // //

router.get(["/login", "/register"], (req, res, next) => {
	res.render("admin/authenticate");
});

router.post("/authenticate", async (req, res, next) => {
	try {
		user = await Admin.findOne({ email: req.body.email });
		if (user == null || user == []) {
			user = null;
			res.render("admin/authenticate", {
				error: "Username or password do not match",
			});
		}
		if (user.password == req.body.password) {
			res.redirect("/admin");
		}
	} catch {
		res.render("admin/authenticate", {
			error: "Username or password do not match",
		});
	}

	res.redirect("/admin/login");
});

// // // // //
// Dashboard
// // // // //

router.get(["/", "/dashboard"], authenticateToken, async (req, res, next) => {
	const resource = await Resource.count();
	const event = await Event.count();
	const teamMember = await Member.count();
	const member = await Email.count();

	res.render("admin/dashboard", {
		event: event,
		resource: resource,
		teamMember: teamMember,
		member: member,
	});
});

router.get("/csv", authenticateToken, async (req, res, next) => {
	const emails = await Email.find();

	let csvContent = "data:text/csv;charset=utf-8,";
	emails.forEach(function (email) {
		csvContent += email.email + "\r\n";
	});

	res.json({ csvContent: csvContent });
});

// // // // //
// Announcements
// // // // //

router.get("/announcement", authenticateToken, async (req, res, next) => {
	const announcements = await Announcement.find();
	res.render("admin/announcement", { announcements: announcements });
});

router.get("/announcement/add", (req, res, next) => {
	res.render("admin/announcementForm", { announcement: new Announcement() });
});

router.post("/announcement/save", authenticateToken, async (req, res, next) => {
	const announcement = new Announcement({
		title: req.body.title,
		description: req.body.description,
		category: req.body.category,
	});
	try {
		const newAnnouncement = await announcement.save();
		res.redirect("/admin/announcement");
	} catch {
		res.render("admin/announcementForm", {
			announcement: announcement,
			errorMessage: "Error creating announcement",
		});
	}
});

router.get(
	"/announcement/:id/edit",
	authenticateToken,
	async (req, res, next) => {
		try {
			const announcement = await Announcement.findById(req.params.id);
			res.render("admin/announcementEditForm", {
				announcement: announcement,
			});
		} catch {
			res.redirect("/admin/announcement");
		}
	}
);

router.put("/announcement/:id", authenticateToken, async (req, res, next) => {
	let announcement;
	try {
		announcement = await Announcement.findById(req.params.id);
		announcement.title = req.body.title;
		announcement.description = req.body.description;
		announcement.category = req.body.category;
		await announcement.save();
		res.redirect("/admin/announcement");
	} catch {
		if (announcement == null) {
			res.redirect("/admin/announcement");
		} else {
			res.render("admin/announcementEditForm", {
				announcement: announcement,
				errorMessage: "Error updating announcement",
			});
		}
	}
});

router.put(
	"/announcement/:id/active/:state",
	authenticateToken,
	async (req, res, next) => {
		let announcement;
		try {
			announcement = await Announcement.findById(req.params.id);
			if (req.params.state == "true") {
				announcement.isActive = false;
			} else {
				announcement.isActive = true;
			}
			const newAnnouncement = await announcement.save();
			res.json({
				isActive: newAnnouncement.isActive,
			});
		} catch {
			if (announcement == null) {
				res.json({
					error: "No such announcement exist",
				});
			} else {
				res.json({
					error: "Error updating announcement",
				});
			}
		}
	}
);

router.delete(
	"/announcement/:id",
	authenticateToken,
	async (req, res, next) => {
		let announcement;
		try {
			announcement = await Announcement.findById(req.params.id);
			await announcement.remove();
			res.redirect("/admin/announcement");
		} catch {
			if (announcement == null) {
				res.redirect("/admin/announcement");
			} else {
				res.redirect("/admin/announcement");
			}
		}
	}
);

// // // // //
// Events
// // // // //

router.get("/event", authenticateToken, async (req, res, next) => {
	const event = await Event.find(
		{},
		{
			title: 1,
			description: 1,
			host: 1,
			category: 1,
			eventDate: 1,
			rsvpDate: 1,
			isActive: 1,
			createdDate: 1,
			modifiedDate: 1,
			rsvpLink: 1,
			photoLink: 1,
		}
	);
	res.render("admin/event", { events: event });
});

router.get("/event/add", (req, res, next) => {
	res.render("admin/eventForm", { event: new Event() });
});

router.post("/event/save", authenticateToken, async (req, res, next) => {
	const event = new Event({
		title: req.body.title,
		description: req.body.description,
		host: req.body.host,
		category: req.body.category,
		eventDate: new Date(req.body.eventDate + "T" + req.body.eventTime),
		rsvpDate: new Date(req.body.rsvpDate + "T" + req.body.rsvpTime),
		rsvpLink: req.body.rsvpLink,
		photoLink: req.body.photoLink,
	});
	saveEventPhotos(event, req.body.poster, req.body.images);
	try {
		const newEvent = await event.save();
		res.redirect("/admin/event");
	} catch {
		res.render("admin/eventForm", {
			event: event,
			errorMessage: "Error creating event",
		});
	}
});

router.get("/event/:id/edit", authenticateToken, async (req, res, next) => {
	try {
		const event = await Event.findById(req.params.id, {
			title: 1,
			description: 1,
			host: 1,
			category: 1,
			eventDate: 1,
			rsvpDate: 1,
			isActive: 1,
			createdDate: 1,
			modifiedDate: 1,
			rsvpLink: 1,
			photoLink: 1,
		});

		// Event Date & Time
		var date = event.eventDate.toLocaleDateString([], {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		const eventDate =
			date.substring(6, 11) +
			"-" +
			date.substring(0, 2) +
			"-" +
			date.substring(3, 5);
		const eventTime = event.eventDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

		// Rsvp Date & Time
		var date = event.rsvpDate.toLocaleDateString([], {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
		});
		const rsvpDate =
			date.substring(6, 11) +
			"-" +
			date.substring(0, 2) +
			"-" +
			date.substring(3, 5);
		const rsvpTime = event.rsvpDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
		res.render("admin/eventEditForm", {
			event: event,
			eventDate: eventDate,
			eventTime: eventTime,
			rsvpDate: rsvpDate,
			rsvpTime: rsvpTime,
		});
	} catch {
		res.redirect("/admin/event");
	}
});

router.get("/event/:id/getPhoto", authenticateToken, async (req, res, next) => {
	try {
		const event = await Event.findById(req.params.id, {
			title: 0,
			description: 0,
			host: 0,
			category: 0,
			eventDate: 0,
			rsvpDate: 0,
			isActive: 0,
			createdDate: 0,
			modifiedDate: 0,
			rsvpLink: 0,
			photoLink: 0,
		});
		res.json({ poster: event.getPoster, images: event.getImages });
	} catch {
		res.json({ error: "Event not found" });
	}
});

router.put("/event/:id", authenticateToken, async (req, res, next) => {
	let event;
	try {
		event = await Event.findById(req.params.id);
		event.title = req.body.title;
		event.description = req.body.description;
		event.host = req.body.host;
		event.category = req.body.category;
		event.eventDate = new Date(
			req.body.eventDate + "T" + req.body.eventTime
		);
		event.rsvpDate = new Date(req.body.rsvpDate + "T" + req.body.rsvpTime);
		event.rsvpLink = req.body.rsvpLink;
		event.photoLink = req.body.photoLink;

		saveEventPhotos(event, req.body.poster, req.body.images);
		await event.save();
		res.redirect("/admin/event");
	} catch {
		if (event == null) {
			res.redirect("/admin/event");
		} else {
			res.render("admin/eventEditForm", {
				event: event,
				errorMessage: "Error updating event",
			});
		}
	}
});

router.put(
	"/event/:id/active/:state",
	authenticateToken,
	async (req, res, next) => {
		let event;
		try {
			event = await Event.findById(req.params.id);
			if (req.params.state === "true") {
				event.isActive = false;
			} else {
				event.isActive = true;
			}
			const newEvent = await event.save();
			res.json({
				isActive: newEvent.isActive,
			});
		} catch {
			if (event == null) {
				res.json({
					error: "No such event exist",
				});
			} else {
				res.json({
					error: "Error updating event",
				});
			}
		}
	}
);

router.delete("/event/:id", authenticateToken, async (req, res, next) => {
	let event;
	try {
		event = await Event.findById(req.params.id);
		await event.remove();
		res.redirect("/admin/event");
	} catch {
		if (event == null) {
			res.redirect("/admin/event");
		} else {
			res.redirect("/admin/event");
		}
	}
});

function saveEventPhotos(event, posterEncoded, imagesEncoded) {
	if (imagesEncoded == null && posterEncoded == null) return;

	if (imagesEncoded != null) {
		let images = [];
		let imageJSON = [];
		try {
			const temp = JSON.parse(imagesEncoded);
			imageJSON.push(imagesEncoded);
		} catch (e) {
			imageJSON = imagesEncoded;
		}

		imageJSON.forEach((element) => {
			const image = JSON.parse(element);
			if (image != null && imageMimeTypes.includes(image.type)) {
				var imageBuffer = new Buffer.from(image.data, "base64");
				var imageType = image.type;
				images.push({
					imageBuffer,
					imageType: imageType,
				});
			}
		});
		event.images = images;
	}
	if (posterEncoded != null) {
		const poster = JSON.parse(posterEncoded);
		if (poster != null && imageMimeTypes.includes(poster.type)) {
			var posterBuffer = new Buffer.from(poster.data, "base64");
			var posterType = poster.type;
			event.poster = {
				posterBuffer,
				posterType: posterType,
			};
		}
	}
}

// // // // //
// Resources
// // // // //

router.get("/resource", authenticateToken, async (req, res, next) => {
	const resources = await Resource.find(
		{},
		{
			title: 1,
			description: 1,
			tags: 1,
			isActive: 1,
			createdDate: 1,
		}
	);
	res.render("admin/resource", { resources: resources });
});

router.get("/resource/add", (req, res, next) => {
	res.render("admin/resourceForm", { resource: new Resource() });
});

router.post("/resource/save", authenticateToken, async (req, res, next) => {
	const resource = new Resource({
		title: req.body.title,
		description: req.body.description,
		tags: req.body.tags,
	});
	saveResourceFile(resource, req.body.file);
	try {
		await resource.save();
		res.redirect("/admin/resource");
	} catch {
		res.render("admin/resourceForm", {
			resource: resource,
			errorMessage: "Error creating resource",
		});
	}
});

router.get("/resource/:id/edit", authenticateToken, async (req, res, next) => {
	try {
		const resource = await Resource.findById(req.params.id, {
			title: 1,
			description: 1,
			tags: 1,
			isActive: 1,
			createdDate: 1,
		});
		res.render("admin/resourceEditForm", { resource: resource });
	} catch {
		res.redirect("/admin/resource");
	}
});

router.get(
	"/resource/:id/getFile",
	authenticateToken,
	async (req, res, next) => {
		try {
			const resource = await Resource.findById(req.params.id, {
				title: 0,
				description: 0,
				tags: 0,
				isActive: 0,
				createdDate: 0,
			});
			res.json({ file: resource.getFile });
		} catch {
			res.json({ error: "Resource not found" });
		}
	}
);

router.put("/resource/:id", authenticateToken, async (req, res, next) => {
	let resource;
	try {
		const resource = await Resource.findById(req.params.id);
		resource.title = req.body.title;
		resource.description = req.body.description;
		resource.tags = req.body.tags;
		saveResourceFile(resource, req.body.file);
		await resource.save();

		res.redirect("/admin/resource");
	} catch {
		if (resource == null) {
			res.redirect("/admin/resource");
		} else {
			res.render("admin/resourceEditForm", {
				resource: resource,
				errorMessage: "Error updating resource",
			});
		}
	}
});

router.delete("/resource/:id", authenticateToken, async (req, res, next) => {
	let resource;
	try {
		resource = await Resource.findById(req.params.id);
		await resource.remove();
		res.redirect("/admin/resource");
	} catch {
		if (resource == null) {
			res.redirect("/admin/resource");
		} else {
			res.redirect("/admin/resource");
		}
	}
});

router.put(
	"/resource/:id/active/:state",
	authenticateToken,
	async (req, res, next) => {
		let resource;
		try {
			resource = await Resource.findById(req.params.id);
			if (req.params.state == "true") {
				resource.isActive = false;
			} else {
				resource.isActive = true;
			}
			const newResource = await resource.save();
			res.json({
				isActive: newResource.isActive,
			});
		} catch {
			if (resource == null) {
				res.json({
					error: "No such resource exist",
				});
			} else {
				res.json({
					error: "Error updating resource",
				});
			}
		}
	}
);

function saveResourceFile(resource, fileEncoded) {
	if (fileEncoded == null) return;
	const file = JSON.parse(fileEncoded);
	if (file != null) {
		var fileBuffer = new Buffer.from(file.data, "base64");
		var fileType = file.type;
		resource.file = {
			fileBuffer,
			fileType: fileType,
		};
	}
}

// // // // //
// Members
// // // // //

router.get("/member", authenticateToken, async (req, res, next) => {
	const members = await Member.find(
		{},
		{
			name: 1,
			description: 1,
			role: 1,
			designation: 1,
		}
	);
	res.render("admin/member", { members: members });
});

router.get("/member/add", (req, res, next) => {
	res.render("admin/memberForm", { member: new Member() });
});

router.post("/member/save", authenticateToken, async (req, res, next) => {
	const member = new Member({
		name: req.body.name,
		description: req.body.description,
		role: req.body.role,
		designation: req.body.designation,
	});
	saveMemberPhoto(member, req.body.photo);
	try {
		await member.save();
		res.redirect("/admin/member");
	} catch {
		res.render("admin/memberForm", {
			member: member,
			errorMessage: "Error creating member",
		});
	}
});

router.get("/member/:id/edit", authenticateToken, async (req, res, next) => {
	try {
		const member = await Member.findById(req.params.id, {
			name: 1,
			description: 1,
			role: 1,
			designation: 1,
		});
		res.render("admin/memberEditForm", { member: member });
	} catch {
		res.redirect("/admin/member");
	}
});

router.get(
	"/member/:id/getPhoto",
	authenticateToken,
	async (req, res, next) => {
		try {
			const member = await Member.findById(req.params.id, {
				name: 0,
				description: 0,
				role: 0,
				designation: 0,
			});
			res.json({ memberPhoto: member.getPhoto });
		} catch {
			res.json({ error: "Member not found" });
		}
	}
);

router.put("/member/:id", authenticateToken, async (req, res, next) => {
	let member;
	try {
		member = await Member.findById(req.params.id);
		member.name = req.body.name;
		member.description = req.body.description;
		member.role = req.body.role;
		member.designation = req.body.designation;
		saveMemberPhoto(member, req.body.photo);
		await member.save();
		res.redirect("/admin/member");
	} catch {
		if (member == null) {
			res.redirect("/admin/member");
		} else {
			res.render("admin/memberEditForm", {
				member: member,
				errorMessage: "Error updating member",
			});
		}
	}
});

router.delete("/member/:id", authenticateToken, async (req, res, next) => {
	let member;
	try {
		member = await Member.findById(req.params.id);
		await member.remove();
		res.redirect("/admin/member");
	} catch {
		if (member == null) {
			res.redirect("/admin/member");
		} else {
			res.redirect("/admin/member");
		}
	}
});

function saveMemberPhoto(member, photoEncoded) {
	if (photoEncoded == null) return;
	const photo = JSON.parse(photoEncoded);
	if (photo != null) {
		var photoBuffer = new Buffer.from(photo.data, "base64");
		var photoType = photo.type;
		member.photo = {
			photoBuffer,
			photoType: photoType,
		};
	}
}

// // // // //
// CMS
// // // // //

router.get("/cms", authenticateToken, async (req, res, next) => {
	const cms = await CMS.findOne();
	res.render("admin/cms", { cms: cms });
});

router.get("/cms/edit", authenticateToken, async (req, res, next) => {
	try {
		const cms = await CMS.findOne();
		res.render("admin/cmsEditForm", { cms: cms });
	} catch {
		res.redirect("/admin/cms");
	}
});

router.put("/cms/save", authenticateToken, async (req, res, next) => {
	let cms;
	try {
		cms = await CMS.findOne();
		cms.homepage = {
			headerTitle: req.body.headerTitle,
			headerSubtitle: req.body.headerSubtitle,
			announcementTitle: req.body.announcementTitle,
			announcementSubtitle: req.body.announcementSubtitle,
			eventTitle: req.body.eventTitle,
			eventButton: req.body.eventButton,
			emailTitle: req.body.emailTitle,
			emailSubtitle: req.body.emailSubtitle,
		};
		cms.event = {
			upcomingEventTitle: req.body.upcomingEventTitle,
			upcomingEventSubtitle: req.body.upcomingEventSubtitle,
			allEventTitle: req.body.allEventTitle,
		};
		cms.aboutUs = {
			aboutUsMotive: req.body.aboutUsMotive,
			leaderTitle: req.body.leaderTitle,
			memberTitle: req.body.memberTitle,
		};
		cms.resource = {
			resourceTitle: req.body.resourceTitle,
		};
		cms.announcement = {
			allAnnouncementTitle: req.body.allAnnouncementTitle,
		};
		cms.footer = {
			emailTitle: req.body.emailTitle,
			emailSubtitle: req.body.emailSubtitle,
		};
		await cms.save();
		res.redirect("/admin/cms");
	} catch {
		if (cms == null) {
			res.redirect("/admin/cms");
		} else {
			res.render("admin/cmsEditForm", {
				cms: cms,
				errorMessage: "Error updating cms",
			});
		}
	}
});

// // // // //
// Users
// // // // //

router.get("/user", authenticateToken, async (req, res, next) => {
	const users = await Admin.find();
	res.render("admin/user", { users: users });
});

router.get("/user/add", (req, res, next) => {
	res.render("admin/userForm", { user: new Admin() });
});

router.post("/user/save", authenticateToken, async (req, res, next) => {
	const user = new Admin({
		username: req.body.username,
		email: req.body.email,
		role: req.body.role,
		password: req.body.password,
	});
	try {
		await user.save();
		res.redirect("/admin/user");
	} catch {
		res.render("admin/userForm", {
			user: user,
			errorMessage: "Error creating user",
		});
	}
});

router.get("/user/:id/edit", authenticateToken, async (req, res, next) => {
	try {
		const user = await Admin.findById(req.params.id);
		res.render("admin/userEditForm", { user: user });
	} catch {
		res.redirect("/admin/user");
	}
});

router.put("/user/:id", authenticateToken, async (req, res, next) => {
	let user;
	try {
		user = await Admin.findById(req.params.id);
		user.username = req.body.username;
		user.email = req.body.email;
		user.role = req.body.role;
		if (req.body.password != "") {
			user.password = req.body.password;
		}
		await user.save();
		res.redirect("/admin/user");
	} catch {
		if (user == null) {
			res.redirect("/admin/user");
		} else {
			res.render("admin/userEditForm", {
				user: user,
				errorMessage: "Error updating user",
			});
		}
	}
});

router.delete("/user/:id", authenticateToken, async (req, res, next) => {
	let user;
	try {
		user = await Admin.findById(req.params.id);
		await user.remove();
		res.redirect("/admin/user");
	} catch {
		if (user == null) {
			res.redirect("/admin/user");
		} else {
			res.redirect("/admin/user");
		}
	}
});

function authenticateToken(req, res, next) {
	if (user == null) res.redirect("/admin/login");
	next();
}

module.exports = router;
