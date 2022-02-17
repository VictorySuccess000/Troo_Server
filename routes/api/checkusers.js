const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Joi = require("joi");
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  // confirmpassword:Joi.string().valid(Joi.ref('password')).required()
});

router.post("/", async (req, res) => {
  // validation of user inputs
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const { name, email } = req.body;
  try {
    let tmpname = await User.findOne({ name });
    if (tmpname) {
      return res.status(400).send("Username is already taken");
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).send("Email is already registered");
    }
    res.send("success");
  } catch (err) {
    res.status(500).send("No match");
  }
});
router.post("/name", async (req, res) => {
  const { name } = req.body;
  console.log("name",name);
  try {
    let tmpname = await User.findOne({ name });
    if (tmpname) {
      return res.status(400).send("Username is already taken");
    }
    res.send("success");
  } catch (err) {
    res.status(500).send("No match");
  }
});

router.post("/email", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("Email is already registered");
    }
    res.send("success");
  } catch (err) {
    res.status(500).send("No match");
  }
});

module.exports = router;
