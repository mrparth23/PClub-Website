const express = require("express");
const router = express.Router();

//  Models
const Announcement = require("./../models/announcement");
const CMS = require("./../models/cms");
const Event = require("./../models/event");
const Resource = require("./../models/resource");
const Member = require("./../models/member");
const Email = require("./../models/email");

// // // // //
// Homepage
// // // // //

router.get("/", async (req, res, next) => {
	const cms = await CMS.findOne();
	const announcement = await Announcement.find({ isActive: "true" });
	const events = await Event.find(
		{ isActive: "true" },
		{
			title: 1,
			host: 1,
			category: 1,
			eventDate: 1,
		}
	)
		.sort({ eventDate: -1 })
		.limit(4);

	res.render("user/homepage", {
		homepage: cms.homepage,
		footer: cms.footer,
		announcements: announcement,
		events: events,
	});
});

// // // // //
// Event
// // // // //

router.get("/event", async (req, res, next) => {
	const cms = await CMS.findOne();
	const events = await Event.find(
		{ isActive: "true" },
		{ title: 1, host: 1, category: 1, eventDate: 1, poster: 1 }
	).sort({
		eventDate: -1,
	});
	res.render("user/event", {
		footer: cms.footer,
		event: cms.event,
		events: events,
	});
});

// // // // //
// Announcement
// // // // //

router.get("/announcement", async (req, res, next) => {
	const cms = await CMS.findOne();
	const announcements = await Announcement.find({ isActive: "true" }).sort({
		eventDate: -1,
	});
	res.render("user/announcement", {
		footer: cms.footer,
		announcements: announcements,
		announcement: cms.announcement,
	});
});

// // // // //
// Resource
// // // // //

router.get("/resource", async (req, res, next) => {
	const cms = await CMS.findOne();
	const resources = await Resource.find(
		{ isActive: "true" },
		{
			title: 1,
			description: 1,
			tags: 1,
			createdDate: 1,
		}
	);
	res.render("user/resource", {
		footer: cms.footer,
		resource: cms.resource,
		resources: resources,
	});
});

router.get("/resource/:id/getFile", async (req, res, next) => {
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
});

// // // // //
// About Us
// // // // //

router.get("/about-us", async (req, res, next) => {
	const cms = await CMS.findOne();
	const members = await Member.find();

	res.render("user/about", {
		footer: cms.footer,
		about: cms.aboutUs,
		members: members,
	});
});

// // // // //
// Event-detail
// // // // //

router.get("/event/:id", async function (req, res, next) {
	const event = await Event.findById(req.params.id);
	const cms = await CMS.findOne();
	res.render("user/event-detail", { footer: cms.footer, event: event });
});

router.get("/event/:id/getImages", async (req, res, next) => {
	try {
		const event = await Event.findById(req.params.id, {
			title: 0,
			description: 0,
			category: 0,
			isActive: 0,
			createdDate: 0,
			host: 0,
			poster: 0,
			eventDate: 0,
			rsvpLink: 0,
			rsvpDate: 0,
			photoLink: 0,
			modifiedDate: 0,
		});
		res.json({ images: event.getImages });
	} catch {
		res.json({ error: "Event not found" });
	}
});

// // // // //
// Email-Subscription
// // // // //

router.post("/email-subscription", async (req, res, next) => {
	try {
		let email = await Email.find({ email: req.body.email });
		if (!email.length) {
			if (req.body.email.length) {
				email = new Email({
					email: req.body.email,
				});
				await email.save();
				res.json({
					message:
						"Congratulation!! Your email is subscribed with PClub.",
				});
			} else {
				res.json({ error: "Please enter a valid email" });
			}
		} else {
			res.json({ message: "This email already exists!" });
		}
	} catch {
		res.json({ error: "Not a valid AU email-address" });
	}
});

module.exports = router;
