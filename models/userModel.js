const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    avatar: {
        type: String, // URL or path to the user's avatar image
    },
    googleId: {
        type: String, // Unique identifier from Google
        unique: true, // Ensure this is unique across users
        sparse: true, // Allows for `googleId` to be missing in some cases
    },
    address : {
        type: String,
    },
    college : {
        type: String,
    },
    phone : {
        type : String,
    },
    isPremium: {
        type: Boolean,
        required: true,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    examAttempts: [
        {
            date: { type: Date },
            count: { type: Number},
        },
    ],
    ipAddresses: [
            {
                type: String,
            },
        ],
        userAgents: [
            {
                type: String,
            },
        ],
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
