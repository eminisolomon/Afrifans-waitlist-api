const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Waitlist = require("../model/waitlistModel");
const sendEmail = require("../utils/sendEmail");
const waitlist = require("../email/waitlist");
const contentemail = require("../email/contentemail");

const WaitList = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please add your email");
  }

  if (!name) {
    res.status(400);
    throw new Error("Please add your name");
  }

  if (email) {
    let user = await Waitlist.findOne({ email });

    if (user) {
      res.status(400).json({
        message: "You are already on our waitlist",
        success: false,
      });
      return;
    } else {
      await Waitlist.create({
        _id: new mongoose.Types.ObjectId(),
        email,
        name,
      });
    }
  }

  try {
    const emailTemplate = waitlist(name);
    const to = email;
    const subject = "Thanks For Joining";
    const html = emailTemplate.html;

    await sendEmail(to, subject, html);
    console.log("Welcome Email sent!");
    res.status(200).json({ success: true, message: "Waitlist Email Sent" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Email not sent, please try again" });
  }
});

const sendEmailToWaitlist = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const waitlistUsers = await Waitlist.find({}).select("email name -_id");

  try {
    for (let i = 0; i < waitlistUsers.length; i++) {
      const user = waitlistUsers[i];
      const emailTemplate = contentemail(user.name, content);
      const subject = title;
      const to = user.email;
      const html = emailTemplate.html;

      await sendEmail(to, subject, html);
      console.log("Welcome Email sent!");
    }
    res.status(200).json({ success: true, message: "Waitlist Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

module.exports = {
  WaitList,
  sendEmailToWaitlist,
};
