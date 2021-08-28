const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const { body, validationResult, checkSchema } = require("express-validator");
const User = require("../models/UserModel");

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    await User.findOne({ email: user.email }).then((result) => {
      delete result.password;
      res.json(result);
    });
  } catch (error) {
    res.status(500).json({ messge: "Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    await User.findOneAndUpdate({ email: req.user.emial }, req.body, {
      new: true,
    }).then((result) => {
      if (result) res.json({ user: result });
      else res.status(500).json({ message: "Something went wrong" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// init upload
const upload = multer({
  storage: storage,
}).single("myImage");

const updateAvatar = async (req, res) => {
  try {
    upload(req, res, (err) => {
      if (req.file) {
        User.findOneAndUpdate(
          { email: req.user.email },
          { profile: req.file.filename },
          { new: true }
        ).then((result) => {
          res.json({ avatar: result.profile });
        });
      }
    });
  } catch (error) {}
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const newPassword = bcrypt.hashSync(req.body.password, 10);

    await User.findOneAndUpdate(
      { email: req.user.email },
      { password: newPassword }
    )
      .then((result) => {
        if (result) {
          res.json({ message: "Password update successful" });
        }
      })
      .catch((err) => {
        res.json({ message: "Something went wrong" });
      });
  } catch (error) {
    res.json({ message: "Server Error" });
  }
};

const getProfileBySlug = async (req, res) => {
  try {
    await User.findOne({ slug: req.params.slug })
      .then((result) => {
        delete result.password;
        res.json(result);
      })
      .catch((_) =>
        res.status(400).json({
          message: "Something went wrong while fetching prfile info",
        })
      );
  } catch (error) {
    res.status(500).json({ messge: "Server Error" });
  }
};

const validateProfile = (method) => {
  switch (method) {
    case "changepassword":
      return [
        body("old_password")
          .exists()
          .withMessage("Old password filed is required")
          .custom((value, { req }) => {
            return User.findOne({ email: req.user.email }).then((user) => {
              if (!user || !bcrypt.compareSync(value, user.password)) {
                return Promise.reject("Old password does not match");
              }
            });
          }),
        body("password").exists().withMessage("Password field is required"),
        body("confirm_password")
          .exists()
          .withMessage("Confirm password field is required")
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              return Promise.reject(
                "Password confirmation does not match password"
              );
            }
            return true;
          }),
      ];
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  getProfileBySlug,
  validateProfile,
};
