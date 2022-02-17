const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

router.post(
    '/',    
    async(req, res) => {
        const {email, password} = req.body;
        try {
            const user=await User.findOne({email});
            if (!user) {
                return res
                .status(400)
                .send('Incorrect Email Address');
            }
      
            const salt = await bcrypt.genSalt(10);      
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            res.send("success change");
        } catch (err) {
        res.status(500).send(err.message);
        }
    }
);

module.exports = router;
