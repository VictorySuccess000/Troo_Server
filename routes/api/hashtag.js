const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Tag = require('../../models/Hashtag')

//to get all tags
router.get(`/`, async (req, res) => {
    let tags = await Tag.find({});
    if (!tags) {
      return res.status(204).send({
        error: true,
      });
    }
    return res.status(200).send({
      error: false,
      tags,
    });
  });

  //to search tags
  router.get(`/tag/search`, async (req, res) => {
    let tags = await Tag.find({ name: new RegExp(req.query.name, "i") });
    if (!tags) {
      return res.status(204).send({
        error: true,
      });
    }
    return res.status(200).send({
      error: false,
      tags,
    });
  });

  //to get a tag
  router.get(`/tag/:id`, async (req, res) => {
    let tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(204).send({
        error: true,
      });
    }
    return res.status(200).send({
      error: false,
      tag,
    });
  });

  //to add a tag
  router.post(`/tag`, async (req, res) => {
    const body = req.body;
    if (!body) {
      return res.status(400).send({
        error: true,
        errorMessage: "You must provide details",
      });
    }    
    const tag_exist = await Tag.findOne({name:body.name});

    if(tag_exist == null) {
      await Tag.create(body).save(function (err) {
        if (err) {
          return res.status(400).send({
            error: true,
            errorMessage: "Invalid details",
          });
        }
      });
    }
    return res.status(200).send({
      error: false
    });
  });

  //to modify a tag
  router.put(`/tag/:id`, async (req, res) => {
    const body = req.body;
    if (!body) {
      return res.status(400).json({
        error: true,
        errorMessage: "You must provide details",
      });
    }
    let tag = await Tag.updateOne({ _id: req.params.id }, body);
    return res.status(200).send({
      error: false,
      tag,
    });
  });

  //to delete a tag
  router.delete(`/tag/:id`, async (req, res) => {
    let tag = await Tag.deleteOne({ _id: req.params.id });
    return res.status(200).send({
      error: false,
      tag,
    });
  });

module.exports = router;