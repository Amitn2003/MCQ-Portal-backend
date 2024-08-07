const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { z } = require('zod');

const registerSchema = z.object({
    name: z.string()
      .min(4, { message: "Name must be at least 4 characters long" }),
    email: z.string()
      .email({ message: "Invalid email address" }),
    password: z.string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  });
  
  const loginSchema = z.object({
    email: z.string()
      .email({ message: "Invalid email address" }),
    password: z.string()
      .min(1, { message: "Password is required" }),
  });














    // Utility function to get IP address
    const getClientIp = (req) => {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    };

    // Utility function to get User-Agent
    const getUserAgent = (req) => {
        return req.headers['user-agent'];
    };


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    try {
        // const { name, email, password } = registerSchema.parse(req.body);
        const { name, email, password, address, college, phone } = registerSchema.parse(req.body);
        // console.log("Rgister user control", { name, email, password } )
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User with this email already exists' });
            throw new Error('User already exists');
        }

        // Capture hidden data
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

        const user = await User.create({
            name,
            email,
            password,
            address,
            college,
            phone,
            ipAddresses: [ipAddress],
            userAgents: [userAgent],
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                address: user.address,
                college: user.college,
                phone: user.phone,
                isAdmin: user.isAdmin,
                isPremium : user.isPremium ,
                token: generateToken(user._id),
                message: 'User registered successfully',
            });
        } else {
            res.status(400).json({ message: 'Failed to register user. Please try again' });
            throw new Error('Invalid user data');
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle Zod validation errors
            const issues = error.issues.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message
            }));
            res.status(400).json({
                message: 'Validation failed',
                issues
            });
        } else {
        // Catch any errors that occur during registration
        res.status(500).json({ message: error.message || 'Server error' });
        }
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {     // Login user
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {

      // Capture hidden data
      const ipAddress = getClientIp(req);
      const userAgent = getUserAgent(req);

      // Update user with hidden data (append to arrays)
      if (!user.ipAddresses.includes(ipAddress)) {
          user.ipAddresses.push(ipAddress);
      }
      if (!user.userAgents.includes(userAgent)) {
          user.userAgents.push(userAgent);
      }
      console.log(user)

      await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                college: user.college,
                address: user.address,
                phone: user.phone,
                isPremium : user.isPremium ,
                token: generateToken(user._id),
                message: 'User logged in successfully',
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle Zod validation errors
            const issues = error.issues.map(issue => ({
                path: issue.path.join('.'),
                message: issue.message
            }));
            res.status(400).json({
                message: 'Validation failed',
                issues
            });
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    registerUser,
    authUser,
};
