const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { z } = require('zod');
const generateToken = require('../utils/generateToken');
// const bcrypt = require('bcryptjs');

// Schema for profile update validation
const profileSchema = z.object({
    name: z.string().min(1, { message: 'Name must be at least 1 character long' }),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(4, { message: 'Password must be at least 4 characters long' }).optional(),
});

// Schema for user update by admin
const userUpdateSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    isAdmin: z.boolean(),
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar,
            isPremium : user.isPremium,
            college: user.college,
            phone: user.phone,
            address: user.address,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    // console.log("Previous user ", user)
    if (user) {
        const { name, email, password, college, phone, address } = req.body;
        // profileSchema.parse(req.body);
        if (name) user.name = name;
        if (email) user.email = email;
        if (college) user.college = college;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (password) user.password = password;
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isPremium : user.isPremium,
            token: generateToken(updatedUser._id),
            avatar: updatedUser.avatar,
            college: updatedUser.college,
            phone: updatedUser.phone,
            address: updatedUser.address,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    console.log(user)

    if (user) {
        // const { name, email, isAdmin } = userUpdateSchema.parse(req.body);
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
        user.isPremium = req.body.isPremium !== undefined ? req.body.isPremium : user.isPremium;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isPremium: updatedUser.isPremium,
        });
    } else {
        res.status(404).json({"message" : "Failed to update user."});
        throw new Error('User not found');
    }
});

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
};
