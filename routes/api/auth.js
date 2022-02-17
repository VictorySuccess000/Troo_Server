var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const config = require("config");
const Joi = require("joi");
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  // confirmpassword:Joi.string().valid(Joi.ref('password')).required()
});
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) res.json(user);
    else res.status(401).send("NoUser");
  } catch (err) {
    console.log("finding error");
    res.status(500).send("Server Error");
  }
});

router.post('/',
  async (req, res) => {
    // validation of user inputs
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email })
      if (!user) {
        return res
          .status(400)
          .send('Incorrect Email Address');
      }
      // checking if users password mathces
      const validpassword = await bcrypt.compare(password, user.password);
      if (!validpassword) return res.status(400).send("Incorrect Password");
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload, config.get('jwtSecret'), { expiresIn: '2h' }, (err, token) => {
          if (err) {
            console.log(err);
            throw err;
          }
          res.send({ token, user });
        }
      )

    } catch (error) {
      res.status(500).send(error.message);
    }

  });

router.post('/name', async (req, res) => {
  try {
    const user = await User.findById(req.body.id).select('-password');
    if (user) res.json(user.name);
    else res.status(401).send("NoUser");
  } catch (err) {
    console.log("finding error");
    res.status(500).send("Server Error");
  }
})
module.exports = router;
