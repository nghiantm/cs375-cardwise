const bcrypt = require('bcrypt');
const User = require('../models/User');


exports.register = async (req, res) => {
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
    
}