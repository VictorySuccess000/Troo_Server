const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const fs = require("fs");
const config = require("config");
const User = require("../../models/User");
const Blog = require("../../models/Blog");
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");
const checkObjectId = require("../../middleware/checkObjectId");
const Jimp = require("jimp");

resize = async (file, width, height) => {
  const [image] = await Promise.all([Jimp.read(file)]);
  image.resize(width, height);
  return image;
};

dirname = process.cwd();

router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/viewProfile", auth, async (req, res) => {
  try {
    const profile = await User.findOne({ name: req.body.select_name });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})
router.post("/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/:username", auth, checkObjectId("username"), async (req, res) => {
  try {
    const profile = await Profile.findOne({ name: req.params.username });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.put("/follow/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    //selected user's follower field access
    const profile = await Profile.findOne({ user: req.params.id });

    if (profile.followers.some((follower) => follower.user.toString() === req.user.id)) {
      profile.followers = profile.followers.filter(
        ({ user }) => user.toString() !== req.user.id
      );
    } else profile.followers.unshift({ user: req.user.id });

    await profile.save();

    //follwing user's following field access
    const profile_my = await Profile.findOne({ user: req.user.id });

    if (profile_my.following.some((follow) => follow.user.toString() === req.params.id)) {
      profile_my.following = profile_my.following.filter(
        ({ user }) => user.toString() !== req.params.id
      );
    } else profile_my.following.unshift({ user: req.params.id });

    await profile_my.save();

    return res.json(Profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res, next) => {
  console.log('dirname', dirname);
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      let avatar;
      let backimage;
      let name = req.body.name ? req.body.name : profile.name;
      let city = req.body.city ? req.body.city : profile.country;
      let country = req.body.country ? req.body.country : profile.country;
      let bio = req.body.bio ? req.body.bio : profile.bio;
      if (req.body.avatar == undefined) {
        avatar = req.files.avatar;
        const avatarname = `${dirname}/public/avatar/` + req.user.id + `.jpg`;
        await avatar.mv(`${avatarname}`, async (err) => {
          if (err) {
            return res.status(500).send(err);
          }
          // const image = await resize(`${dirname}/public/avatar/${avatar.name}`, 50, 50);
          // await image.writeAsync(avatarname);
          // fs.unlink(`${dirname}/public/avatar/${avatar.name}`, (err) => {
          //   if (err) console.log(err);
          // });
        });
        profile.avatar = "http://localhost:4000/avatar/" + req.user.id + ".jpg";
      }
      if (req.body.avatarMain == undefined) {
        avatarMain = req.files.avatarMain;
        const avatarname = `${dirname}/public/avatar/` + req.user.id + `.jpg` + `main`;
        await avatarMain.mv(`${avatarname}`, async (err) => {
          if (err) {
            return res.status(500).send(err);
          }
          // const image = await resize(`${dirname}/public/avatar/${avatar.name}`, 50, 50);
          // await image.writeAsync(avatarname);
          // fs.unlink(`${dirname}/public/avatar/${avatar.name}`, (err) => {
          //   if (err) console.log(err);
          // });
        });
        // profile.avatar = "http://localhost:4000/avatar/" + req.user.id + ".jpg";
      }
      if (req.body.backimage == undefined) {
        backimage = req.files.backimage;
        const backimgname = `${dirname}/public/backimg/` + req.user.id + `.jpg`;
        await backimage.mv(`${backimgname}`, async (err) => {
          if (err) {
            return res.status(500).send(err);
          }
          // const image = await resize(
          //   `${dirname}/public/${backimage.name}`,
          //   300,
          //   100
          // );
          // await image.writeAsync(backimgname);
          // fs.unlink(`${dirname}/public/backimg/${backimage.name}`, (err) => {
          //   if (err) console.log(err);
          // });
        });
        profile.backimg = "http://localhost:4000/backimg/" + req.user.id + ".jpg";
      }
      if (req.body.backimagemain == undefined) {
        backimagemain = req.files.backimagemain;
        console.log(backimagemain);
        const backimgname = `${dirname}/public/backimg/` + req.user.id + `.jpg` + `main`;
        await backimagemain.mv(`${backimgname}`, async (err) => {
          if (err) {
            return res.status(500).send(err);
          }
          // const image = await resize(
          //   `${dirname}/public/${backimage.name}`,
          //   300,
          //   100
          // );
          // await image.writeAsync(backimgname);
          // fs.unlink(`${dirname}/public/backimg/${backimage.name}`, (err) => {
          //   if (err) console.log(err);
          // });
        });
        // profile.backimg = "http://localhost:4000/backimg/" + req.user.id + ".jpg";
      }
      profile.name = name;
      profile.bio = bio;
      profile.country = country;
      profile.city = city;

      const data = await profile.save();
      return res.json(data);
    }
    return res.status(500).send(err);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
