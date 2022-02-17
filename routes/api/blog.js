const express = require("express");
const router = express.Router();
const fs = require("fs");
const config = require("config");
const User = require("../../models/User");
const Blog = require("../../models/Blog");
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");
const checkObjectId = require("../../middleware/checkObjectId");
const mongoose = require("mongoose");
// import normalize from 'normalize-url';

const imagemark = require("../../controller/imagemark");
// const geocoder = require('./geocode');

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  apiKey: 'AIzaSyCAa8ZgPpTBMcCV7lrNJXvE70JoRs9Wl8I', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

const exifr = require("exifr");
const { NFTStorage, Blob } = require("nft.storage");
const client = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDUxMTY5MjEwMzlFMDc0Q0JmM2FDMTRjNzA1MmRiMGVjNDQwMjcxM2YiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNDA0NzgxMDU5MiwibmFtZSI6ImFuZ2Vsdmlhdml4bmZ0c3RvcmFnZSJ9.Jzu-lEobWzStEaZ7PVwLWT4g_HxTj89co8EhnacX6B4",
});

var ffmpeg = require("fluent-ffmpeg");

ipfsadd = async (
  originfile,
  markedfile,
  creatorid,
  desc,
  hs,
  filetype,
  gpsoutput,
  phonemodel,
  saleoption
) => {
  try {
    const file1 = fs.readFileSync(originfile);
    const file2 = fs.readFileSync(markedfile);
    const originfileCid = await client.storeBlob(new Blob([file1]));
    const originfileUrl = "https://ipfs.io/ipfs/" + originfileCid;

    const markedfileCid = await client.storeBlob(new Blob([file2]));
    const markedfileUrl = "https://ipfs.io/ipfs/" + markedfileCid;
    const blog = await Blog.findOne({ originmetaurl: originfileUrl });
    const thumbnailname = creatorid + '' + Date.now() + '.png';
    if (filetype == "video") {
      await takescreenshot(markedfile, thumbnailname);
    }
    var thumb = 'http://localhost:4000/thumbs/' + thumbnailname;
    const address = await geocoder.reverse({ lat: gpsoutput.latitude, lon: gpsoutput.longitude });
    // console.log("geoaddress", address[0].formattedAddress);
    // console.log(222, address[0].city)
    // console.log(222, address[0].country)

    if (!blog) {
      const newBlog = new Blog({
        creator: creatorid,
        description: desc,
        hideshow: hs,
        filetype: filetype,
        parentpost: 0,
        thumb: thumb,
        originmetaurl: originfileUrl,
        markedmetaurl: markedfileUrl,
        price: saleoption,
        lat: gpsoutput.latitude,
        lng: gpsoutput.longitude,
        address: address[0].city + ", " + address[0].country,
        phonemodel: phonemodel
      });
      await newBlog.save();

      const user = await User.findOne({ _id: creatorid });
      let newvalue = Number(user.vcoin) + 1;
      user.vcoin = newvalue;
      await user.save();

      fs.unlink(originfile, (err) => {
        if (err) console.log(err);
      });
      fs.unlink(markedfile, (err) => {
        if (err) console.log(err);
      });
      return true;
    } else {
      fs.unlink(originfile, (err) => {
        if (err) console.log(err);
      });
      fs.unlink(markedfile, (err) => {
        if (err) console.log(err);
      });
      return false;
    }
  } catch (e) {
    fs.unlink(originfile, (err) => {
      if (err) console.log(err);
    });
    fs.unlink(markedfile, (err) => {
      if (err) console.log(err);
    });
    return "error";
  }
};
takescreenshot = (file, thumbnailname) => {
  return new Promise((resolve, reject) => {
    ffmpeg(file)
      .on('filenames', function (filenames) {
        console.log('screenshots are ' + filenames.join(', '));
      })
      .on('end', function () {
        console.log('screenshots were saved');
        return resolve();
      })
      .on('error', function (err) {
        console.log('an error happened: ' + err.message);
        return reject(err);
      })
      .takeScreenshots({ count: 1, timemarks: ['00:00:01.000'], filename: thumbnailname, size: '320x210' }, "client/thumbs/");
  });
}
videomark = (file) => {
  return new Promise((resolve, reject) => {
    ffmpeg(file)
      .input(`${dirname}/public/mark/video1995312mark.png`)
      .complexFilter([
        'scale=320:210[rescaled]',
        {
          filter: 'overlay', options: { x: 30, y: 120 },
          inputs: 'rescaled', outputs: 'output'
        },
      ], 'output')
      .outputOptions(['-map 0:a', '-c:a aac'])
      .save(`${dirname}/public/21vixresult.mp4`)
      .on("error", function (err) {
        console.log("An error occurred: " + err.message);
        return reject(err);
      })
      .on("end", function () {
        return resolve();
      });
  });
};
dirname = process.cwd();
const LOGO = `${dirname}/public/mark/image1995312mark.png`;
router.post("/", auth, async (req, res, next) => {
  let mediafile = req.files.file;
  mediafile.mv(`${dirname}/public/${req.files.file.name}`, async (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    let metadataUrl = "";
    if (mediafile.mimetype.indexOf("video") !== -1) {
      ffmpeg.ffprobe(
        `${dirname}/public/${req.files.file.name}`,
        async function (err, metadata) {
          // console.log(metadata);
          var meta = metadata.format.tags["com.apple.quicktime.location.ISO6709"];
          var model = metadata.format.tags["com.apple.quicktime.model"];
          var creationtime = metadata.format.tags["creation_time"];
          console.log(creationtime);
          if (meta == undefined || model == undefined || creationtime == undefined) return res.send("invalid");
          else {
            await videomark(`${dirname}/public/${req.files.file.name}`);
            var result = "";
            var index = 0;
            var temp = "";
            var gpsoutput = {};
            var spaceindex = 0;
            var phonemodel = '';
            for (var i = 0; i < model.length; i++) {
              if (model[i] == ' ') {
                if (spaceindex == 1) break;
                spaceindex++;
              }
              phonemodel = phonemodel + model[i];
            }
            console.log("model", phonemodel);
            for (var i = 0; i < meta.length; i++) {
              if (meta[i] == "+" || meta[i] == "-") {
                if (index == 1) {
                  gpsoutput.latitude = Number(temp + Number(result));
                  result = "";
                } else if (index == 2) {
                  gpsoutput.longitude = Number(temp + Number(result));
                }
                index = index + 1;
                temp = meta[i];
              } else result = result + meta[i];
            }
            metadataUrl = ipfsadd(
              `${dirname}/public/${req.files.file.name}`,
              `${dirname}/public/21vixresult.mp4`,
              req.user.id,
              req.body.desc,
              "video",
              gpsoutput,
              phonemodel,
              creationtime,
              req.body.saleoption
            ).then((metadataUrl) => {
              if (metadataUrl === false) res.send("existing");
              else if (metadataUrl === "error") res.send("failure");
              else res.send("success");
            });
          }
        }
      );
    } else if (mediafile.mimetype.indexOf("image") !== -1) {
      // console.log(111, req.body.hs);
      const file1 = fs.readFileSync(`${dirname}/public/${req.files.file.name}`);
      var gpsoutput = await exifr.gps(file1);
      if (gpsoutput == undefined) return res.send("invalid");
      else {
        const image = await imagemark.main(
          `${dirname}/public/${req.files.file.name}`,
          LOGO
        );
        var meta = await exifr.parse(file1);
        var spaceindex = 0;
        var phonemodel = '';
        for (var i = 0; i < meta.Model.length; i++) {
          if (meta.Model[i] == ' ') {
            if (spaceindex == 1) break;
            spaceindex++;
          }
          phonemodel = phonemodel + meta.Model[i];
        }
        console.log("phonemodel", phonemodel);
        await image.writeAsync(`${dirname}/public/21vixresult.jpg`);
        metadataUrl = ipfsadd(
          `${dirname}/public/${req.files.file.name}`,
          `${dirname}/public/21vixresult.jpg`,
          req.user.id,
          req.body.desc,
          req.body.hs,
          "image",
          gpsoutput,
          phonemodel,
          req.body.saleoption
        ).then((metadataUrl) => {
          if (metadataUrl === false) res.send("existing");
          else if (metadataUrl === true) res.send("success");
          else res.send("failure");
        });
      }
    }
  });
});
router.get("/", auth, async (req, res) => {
  try {
    const skip = req.query.skip && /^\d+$/.test(req.query.skip) ? Number(req.query.skip) : 0;
    let skey;
    if (req.query.tag)
      skey = "#" + req.query.tag;
    else
      skey = req.query.skey ? req.query.skey : "";

    let blogs;
    if (skey.search('@') == 0) {
      let user_key = skey.replace("@", "");
      const search_users = await User.find({ name: { $regex: user_key } });
      let creators = search_users.map(item => {
        return item._id;
      });
      blogs = await Blog.find({ creator: { $in: creators } }).skip(skip).sort({ date: -1 }).limit(5);
    } else
      blogs = await Blog.find({ description: { $regex: skey } }).skip(skip).sort({ date: -1 }).limit(5);
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/myfeed", auth, async (req, res) => {
  const followinglist = req.body.myfollowing;
  const id = req.body.id;
  let followingusers = followinglist.map(follwing => {
    return follwing.user;
  });
  try {
    let blogs;
    if (id == undefined)
      blogs = await Blog.find({ $or: [{ creator: req.user.id }, { creator: { $in: followingusers } }] }).sort({ date: -1 });
    else
      blogs = await Blog.find({ _id: id }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.get("/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const blogs = await Blog.find({ _id: req.params.id }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/mysave/", auth, async (req, res) => {
  const skey = req.query.skey ? req.query.skey : "";
  const skip = req.query.skip && /^\d+$/.test(req.query.skip) ? Number(req.query.skip) : 0;
  try {
    const blogs = await Blog.find({ description: { $regex: skey }, saveusers: { $elemMatch: { user: req.user.id } } }, undefined, { skip, limit: 5 }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/myfeed/:type/", auth, async (req, res) => {
  const AlluserInfo = await User.findOne({ name: req.body.select_id });
  let userId = "";
  if (req.body.flag == "viewUserProfile") {
    userId = mongoose.Types.ObjectId(AlluserInfo._id);
  } else {
    userId = mongoose.Types.ObjectId(req.user.id);
  }
  const type = req.params.type;
  const skip = req.query.skip && /^\d+$/.test(req.query.skip) ? Number(req.query.skip) : 0;
  const skey = req.query.skey ? req.query.skey : "";
  let blogs;
  try {
    switch (type) {
      case "picture":
        blogs = await Blog.find({ filetype: "image", creator: userId, description: { $regex: skey } }, undefined, { skip }).sort({ date: -1 });
        break;
      case "popular":
        blogs = await Blog.aggregate([
          { $match: { creator: userId, description: { $regex: skey } } },
          { $addFields: { likes_size: { $size: "$likes" } } },
          { $addFields: { downloads_size: { $size: "$downloads" } } },
          { $addFields: { views_size: { $size: "$views" } } },
          { $addFields: { saves_size: { $size: "$saveusers" } } },
          { $addFields: { sort_order: { $add: ["$likes_size", "$downloads_size", "$views_size", "$saves_size"] } } },
          { $skip: skip },
          { $limit: 5 },
          { $sort: { sort_order: -1, date: -1 } }
        ]);
        break;
      case "earn":
        blogs = await Blog.aggregate([
          { $match: { creator: userId, description: { $regex: skey } } },
          { $addFields: { downloads_size: { $size: "$downloads" } } },
          { $match: { downloads_size: { $gt: 1 } } },
          { $skip: skip },
          { $limit: 5 },
          { $sort: { downloads_size: -1, date: -1 } }
        ]);
        break;
      case "video":
        blogs = await Blog.find({ filetype: "vide", creator: userId, description: { $regex: skey } }, undefined, { skip }).sort({ date: -1 });
        break;
      case "all":
        blogs = await Blog.find({ creator: userId, description: { $regex: skey } }, undefined, { skip }).sort({ date: -1 });
        break;
      case "Likes":
        blogs = await Blog.find({ creator: userId, likes: { $elemMatch: { user: req.user.id } }, description: { $regex: skey } }, undefined, { skip }).sort({ date: -1 });
        break;
      default:
        blogs = await Blog.find({ filetype: "video", creator: userId, description: { $regex: skey } }, undefined, { skip }).sort({ date: -1 });
    }
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/myfeeds/assetcount", auth, async (req, res) => {
  const AlluserInfo = await User.findOne({ name: req.body.selectId });
  try {
    let userId = "";
    let user_id = "";
    if (req.body.flag == "viewUserProfile") {
      userId = mongoose.Types.ObjectId(AlluserInfo._id);
      user_id = AlluserInfo._id;
    } else {
      userId = mongoose.Types.ObjectId(AlluserInfo._id);
      user_id = req.user.id;
    }
    const images = await Blog.count({ creator: user_id, filetype: 'image' });
    const videos = await Blog.count({ creator: user_id, filetype: 'video' });
    const selectUserInfo = await Profile.findOne({ user: user_id });
    const downloads = await Blog.aggregate([
      { $match: { creator: userId } },
      {
        $addFields: {
          downloads_size: { $size: "$downloads" }
        }
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: "$downloads_size"
          }
        }
      }
    ]);
    res.json({ images, videos, downloads, selectUserInfo });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/mylike", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ likes: { $elemMatch: { user: req.user.id } } }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post('/byhashtag', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ description: { $regex: req.body.hashtag } }).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.put("/edit/:id", auth, async (req, res) => {
  let blog_id = mongoose.Types.ObjectId(req.params.id);
  Blog.findByIdAndUpdate(blog_id, { description: req.body.description }, function (err, result) {
    if (err) {
      res.send(err)
    }
    else {
      res.send(result)
    }
  })
});
router.put("/like/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // Check if the blog has already been liked
    if (blog.likes.some((like) => like.user.toString() === req.user.id)) {
      // remove the like
      blog.likes = blog.likes.filter(
        ({ user }) => user.toString() !== req.user.id
      );
    } else blog.likes.unshift({ user: req.user.id });

    await blog.save();

    return res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.put("/saveuser/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // Check if the blog has already been saved
    if (blog.saveusers.some((saveuser) => saveuser.user.toString() === req.user.id)) {
      // remove the save
      blog.saveusers = blog.saveusers.filter(
        ({ user }) => user.toString() != req.user.id
      );
    } else blog.saveusers.unshift({ user: req.user.id });
    await blog.save();

    return res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.put("/download/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // Check if the blog has already been downloaded
    if (!blog.downloads.some((download) => download.user.toString() === req.user.id)) {
      blog.downloads.unshift({ user: req.user.id });
      await blog.save();
      return res.json(blog.downloads);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/report/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // Check if the blog has already been saved
    if (!blog.reporters.some((reporter) => reporter.user.toString() === req.user.id))
      // remove the save
      blog.reporters.unshift({ user: req.user.id });

    await blog.save();

    return res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
