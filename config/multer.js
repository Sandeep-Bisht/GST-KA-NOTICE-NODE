const cors = require("cors");
const express = require("express");
const router = express.Router();
var multer = require("multer");

multer({
  limits: { fieldSize: 2 * 1024 * 1024 },
});

router.use(cors({ origin: true }));

//code for images
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;