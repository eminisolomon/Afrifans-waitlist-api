const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Waitlist = require("../model/waitlistModel");
const sendEmail = require("../utils/sendEmail");


const WaitList = asyncHandler(async (req, res) => {

    const { email, name } = req.body;

    // Validation
    if  (!email) {
        res.status(400);
        throw new Error("Please add your email");
    }

    if (!name) {
        res.status(400);
        throw new Error("Please add your name");
    }

    // Check if email exist
    if (email) {
        let user = await Waitlist.findOne({ email })

    if (user) {
        res.status(400).json({
            message: 'You are already on our waitlist',
            success: false,
        })
    }   else {
        Waitlist.create({
            _id: new mongoose.Types.ObjectId(),
            email,
            name
        })


    }

}
    //send waitlist mail
    const subject = "Waitlist Confirmation";
    const send_to = email;
    const sent_from = "Flowday App <hello@seemetracker.com";
    const reply_to = "no-reply@flowday.net";
    const template = "waitlist";

    try {
        await sendEmail(
        subject,
        send_to,
        sent_from,
        reply_to,
        template,
    );
    res
        .status(200)
        .json({ success: true, message: "Waitlist Email Sent" });
    } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
    }

});

const sendEmailToWaitlist = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    // Get all emails and names in database
    const waitlistUsers = await Waitlist.find({}).select("email name -_id");
  
    // Send email to each email in database
    for (let i = 0; i < waitlistUsers.length; i++) {
      const user = waitlistUsers[i];
      const subject = title;
      const send_to = user.email;
      const sent_from = "Flowday App <hello@seemetracker.com";
      const reply_to = "no-reply@flowday.net";
      const template = "content";
      const name = user.name;
      const emailContent = content;
  
      try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, emailContent);
      } catch (error) {
        console.log(`Error sending email to ${send_to}: ${error}`);
      }
    }
  
    res.status(200).json({ success: true, message: "Emails sent to waitlist" });
  });  

module.exports = {
    WaitList,
    sendEmailToWaitlist,
};