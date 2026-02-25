const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const NichorrAuthController = {
    // 1. SIGNUP: Naya user register karna
    signup: async (req, res) => {
        try {
            const { fullName, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email pehle se registered hai!" });
            }

            // Password ko nichorrna (Hash karna) taake hacker na parh sake
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                plan: 'free',
                credits: 5 // Lala ki taraf se 5 free audits toh bante hain
            });

            await newUser.save();
            res.status(201).json({ success: true, message: "Account ban gaya! Ab Login karein." });
        } catch (error) {
            res.status(500).json({ success: false, message: "Signup Error: " + error.message });
        }
    },

    // 2. LOGIN: Banday ki pehchan karna
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: "User nahi mila!" });
            }

            // Password check karo
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Password ghalat hai!" });
            }

            // Identity Token banayein (JWT)
            const token = jwt.sign(
                { id: user._id, email: user.email, plan: user.plan },
                "LALA_NICHORR_SECRET_786", // Ye aapki secret key hai
                { expiresIn: '24h' }
            );

            res.status(200).json({
                success: true,
                token,
                user: {
                    fullName: user.fullName,
                    email: user.email,
                    plan: user.plan,
                    credits: user.credits
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Login Error: " + error.message });
        }
    }
};

module.exports = NichorrAuthController;