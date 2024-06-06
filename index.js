const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs-extra'); // Added to handle file operations for registrations
const sequelize = require('./config/database');
const User = require('./models/User');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public_html'))); // Changed to 'public_html' to match existing code

sequelize.sync()
    .then(() => console.log('MySQL connected and tables created'))
    .catch(err => console.log(err));

const verificationCodes = {};
const feedbacks = [];
const registrations = [];

const user = { username: 'user', password: 'password' };

// Configure email service with Sendinblue
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: '75594b001@smtp-brevo.com',  // Sendinblue login email
        pass: 'LnEMXRpb6rWNkVc8' //Sendinblue API key
    }
});

// Define a route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'tutorial.html')); // Serve tutorial.html
});

// User login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === user.username && password === user.password) {
        res.send('Login successful');
    } else {
        res.send('Invalid credentials');
    }
});

// Save feedback
app.post('/feedback', (req, res) => {
    const feedback = req.body;
    feedbacks.push(feedback);
    res.send('Feedback saved');
});

// Display feedback
app.get('/feedbacks', (req, res) => {
    res.json(feedbacks);
});

// Save course registration
app.post('/register', (req, res) => {
    const registration = req.body;
    registrations.push(registration);
    fs.writeJson('registrations.json', registrations, { spaces: 2 }, err => {
        if (err) return res.status(500).send('Failed to save registration');
        res.send('Registration saved');
    });
});

// Display course registrations
app.get('/registrations', (req, res) => {
    res.json(registrations);
});

// Search endpoint, when search the offhand flourishing, course.html will open.
app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    if (query === 'offhand flourishing') {
        res.redirect('/course.html');
    } else {
        res.json([]);
    }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.json({ success: false, message: 'Email already registered' });
        }

        user = await User.create({ username, email, password });

        const verificationCode = crypto.randomBytes(3).toString('hex');
        verificationCodes[email] = verificationCode;

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Email Verification',
            text: `Your verification code is: ${verificationCode}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.json({ success: false, message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
            res.json({ success: true, message: 'Verification code sent' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Verify endpoint
app.post('/verify', async (req, res) => {
    const { verificationCode } = req.body;
    const email = Object.keys(verificationCodes).find(email => verificationCodes[email] === verificationCode);

    if (!email) {
        return res.json({ success: false, message: 'Invalid verification code' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        user.verified = true;
        await user.save();
        delete verificationCodes[email];
        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


