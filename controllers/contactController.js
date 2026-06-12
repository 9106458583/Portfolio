const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all fields (name, email, message)'
      });
    }

    // 2. Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // 3. Save to MongoDB Atlas (with local JSON fallback if offline/unconfigured)
    let savedToDb = false;
    let contactSubmissionId = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const contactSubmission = await Contact.create({
          name,
          email,
          message
        });
        contactSubmissionId = contactSubmission._id;
        savedToDb = true;
        console.log(`[Database] Form submission saved to MongoDB Atlas: ID ${contactSubmissionId}`);
      } catch (dbErr) {
        console.error('[Database] MongoDB save error, falling back to local file:', dbErr.message);
      }
    } else {
      console.warn('[Database] MongoDB Atlas is not connected (MONGODB_URI may be empty). Falling back to local file storage.');
    }

    // Fallback: Save to local JSON file if database write failed or MongoDB was offline
    if (!savedToDb) {
      try {
        const localDataDir = path.join(__dirname, '../data');
        const localFilePath = path.join(localDataDir, 'submissions.json');

        // Ensure directory exists
        if (!fs.existsSync(localDataDir)) {
          fs.mkdirSync(localDataDir, { recursive: true });
        }

        // Read existing submissions
        let submissions = [];
        if (fs.existsSync(localFilePath)) {
          const fileData = fs.readFileSync(localFilePath, 'utf8');
          try {
            submissions = JSON.parse(fileData);
          } catch (jsonErr) {
            submissions = [];
          }
        }

        // Add new submission
        const newSubmission = {
          id: new Date().getTime(),
          name,
          email,
          message,
          createdAt: new Date().toISOString()
        };
        submissions.push(newSubmission);

        // Save back
        fs.writeFileSync(localFilePath, JSON.stringify(submissions, null, 2), 'utf8');
        console.log('[Local Storage] Form submission saved locally in data/submissions.json');
      } catch (fsErr) {
        console.error('[Local Storage] Failed to save submission locally:', fsErr.message);
      }
    }

    // 4. Try to send an email notification via Nodemailer (if configured)
    const canSendEmail = 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS && 
      process.env.RECEIVER_EMAIL;

    if (canSendEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: false // Bypass self-signed certificate validation errors in local environments
          }
        });

        const mailOptions = {
          from: `"${name}" <${process.env.SMTP_USER}>`,
          to: process.env.RECEIVER_EMAIL,
          replyTo: email,
          subject: `Portfolio Contact: Message from ${name}`,
          text: `You have received a new message from your portfolio contact form.\n\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n\n` +
                `Message:\n${message}`,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">` +
                `<h2 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px;">New Portfolio Submission</h2>` +
                `<p><strong>Name:</strong> ${name}</p>` +
                `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` +
                `<div style="background-color: #f9f9f9; border-left: 4px solid #3498db; padding: 15px; margin-top: 15px;">` +
                `<p style="margin: 0; font-style: italic;">"${message}"</p>` +
                `</div>` +
                `<hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">` +
                `<p style="font-size: 0.8em; color: #7f8c8d;">Sent from Maulik Vora Portfolio Backend</p>` +
                `</div>`
        };

        // Send email and wait for completion (required for Serverless environments like Vercel)
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Notification sent: ${info.messageId}`);

      } catch (emailErr) {
        console.error('[Email] SMTP initialization error:', emailErr.message);
      }
    } else {
      console.log('[Email] Notification skipped (SMTP credentials not configured in .env)');
    }

    // 5. Respond to client
    return res.status(200).json({
      success: true,
      message: 'Connection Established! Your message has been received.'
    });

  } catch (err) {
    console.error('[Server Error] submitContactForm:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Please try again later.'
    });
  }
};
