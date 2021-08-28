const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const { codeGenerator } = require("../utils/generator_helper");
const User = require("../models/UserModel");
const { registerFromAdmin } = require("../services/MailService");

exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    req.body.password = bcrypt.hashSync("secret", 10);
    req.body.email_verification_token = req.body.phone_verification_token =
      codeGenerator(7);

    await User.create(req.body)
      .then((user) => {
        registerFromAdmin(user.email, user.email_verification_token);
        res.json(user);
      })
      .catch((err) => {
        res
          .status(400)
          .json({ msg: "Something went wrong while creating user" });
      });
  } catch (error) {
    res.status(500).json({ messge: "Server Error" });
  }
};

exports.findUser = async (req, res) => {};

exports.findAllUser = async (req, res) => {
  try {
    var perPage = req.query.per_page ? parseInt(req.query.per_page) : 10;
    var page = req.query.page ? parseInt(req.query.page) : 1;

    var role = req.query.role
      ? req.query.role == "all"
        ? {}
        : { role: req.query.role }
      : {};

    var sort = req.query.sort
      ? { createdAt: req.query.sort }
      : { createdAt: "desc" };
    await User.find(role)
      .limit(perPage)
      .skip(perPage * (page - 1))
      .sort(sort)
      .exec(function (err, users) {
        User.estimatedDocumentCount(role).exec(function (err, count) {
          res.json({
            users: users,
            perPage: perPage,
            page: page,
            total: count,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  } catch (error) {}
};

exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        res
          .status(400)
          .json({ msg: "Something went wrong while updating user" });
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.remove({ _id: req.params.id }, (err, result) => {
      if (err) {
        return res.status(405).send({
          errors: normalizeErrors(err.errors),
        });
      }
      return res.json(result);
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.validateUser = (method) => {
  switch (method) {
    case "createUser":
      return [
        body("name", "Name field is required").notEmpty(),
        body("email")
          .custom((value) => {
            return User.exists({ email: value }).then((user) => {
              if (user) {
                return Promise.reject("E-mail already in use");
              }
            });
          })
          .notEmpty()
          .withMessage("Email field is required")
          .isEmail()
          .withMessage("Email should be in valid format"),
        body("password").notEmpty().withMessage("Password field is required"),
        body("phone")
          .notEmpty()
          .withMessage("Phone field is required.")
          .custom((value) => {
            return User.exists({ phone: value }).then((user) => {
              if (user) {
                return Promise.reject("Phone already in use");
              }
            });
          }),
        body("gender").notEmpty().withMessage("Gender field is required."),
        body("dob").notEmpty().withMessage("DOB field is required"),
        body("role").notEmpty().withMessage("Role field is required"),
      ];

    case "updateUser":
      return [
        body("email")
          .custom((value, { req }) => {
            const val = { "reset_password.token": req.params.token };
            return User.findOne({
              email: value,
              _id: { $ne: req.params.id },
            }).then((user) => {
              if (user) {
                return Promise.reject("E-mail already in use");
              }
            });
          })
          .exists()
          .withMessage("Email field is required"),
      ];
  }
};
