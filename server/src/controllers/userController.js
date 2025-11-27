const bcrypt = require('bcrypt');
const User = require('../models/User');


exports.register = async (req, res,next) => {
    try {
    const {email , password, firstName, lastName} = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success:false,
            message: 'Email and password are required'
        })
    }
    if (!firstName || !lastName) {
        return res.status(400).json({
            success:false,
            message: 'First name and last name are required'
        })
    }
    const existingUser = await User.exists({ email: email });
    if (existingUser) {
        return res.status(409).json({
            success:false,
            message: 'User already exists'
        })
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds); // i would like to later use Oauth

    const newUser = await User.create({
        email,
        passwordHash,
        profile: {
            firstName,
            lastName
        }
    });

    return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            id: newUser._id,
            email: newUser.email,
            firstName: newUser.profile.firstName,
            lastName: newUser.profile.lastName
        }
    });
} catch (error) {
    next(error);
}

    
}