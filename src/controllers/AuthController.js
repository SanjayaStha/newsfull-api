require("dotenv").config();
const jwt = require("jsonwebtoken");
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
// const { transporter, mailOptions } = require("../services/mailer");
const uuid = require("uuid");

exports.userLogin = (req, res) => {
  const { email, password } = req.body;
  console.log({email, password})
  if (!email || !email.length) {
    return res.status(400).json({ error: "email cannot be blank" });
  }
  if (!password || !password.length) {
    return res.status(400).json({ error: "password cannot be blank" });
  }

  User.findOne({ email: email })
    .then((user) => {
      if(user) {
        console.log(user)

        // if (user.email_verified) {
          if (bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign(
              { email: user.email },
              accessTokenSecret
            );
            var result = {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              slug: user.slug,
              profile: user.profile,
              address: user.address,
            };

            return res.status(200).send({
              status: "success",
              token: accessToken,
              user: result,
            });
          } else {
            return res.status(400).send({
              status: "error",
              message: "Incorrect login credentials",
            });
          }
        // } else {
        //   return res.status(400).send({
        //     status: "error",
        //     message:
        //       "Email not verified yet. Please check your mail for verification link.",
        //   });
        // }
      } else {
        return res.status(400).send({
          status: "error",
          message: "Incorrect login credentials",
        });
      }
    })
    .catch((error) => {
      return res.status(500).send({
        status: "error",
        message: error.message,
      });
    });
};

exports.registerUser = async (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).send({
          status: "error",
          message: "User is already registered.",
        });
      } else {
        const verificationToken = uuid.v4();
        req.body.is_verified = false;
        req.body.email_verification_token = verificationToken;
        req.body.phone_verification_token = uuid.v4();
        req.body.signup_source = "Email";
        req.body.role = "Client";
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        User.create(req.body)
          .then(async (user) => {
            // setting email verification mail
            const subject = "FarmGro user verification request";
            const mail_type = "email_verification";
            transporter.sendMail(
              mailOptions(user.email, verificationToken, subject, mail_type),
              (err, info) => {
                if (err)
                  return res.status(500).json({
                    status: "Error",
                    message:
                      "User was registered but email verification mail couldnot send",
                  });
              }
            );
            return res.status(200).send({
              status: "success",
              message:
                "Thank you for registering with us. Please check your email for verification link.",
            });
          })
          .catch((error) => {
            return res.status(500).send({
              status: "error",
              message: error.message,
            });
          });
      }
    })
    .catch((error) => {
      return res.status(500).send({
        status: "error",
        message: error.message,
      });
    });
};

exports.verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { email, code } = req.body;
    await User.findOne({ email: email, email_verification_token: code }).then(
      (user) => {
        if (user) {
          user.email_verified = true;
          user.email_verification_token = null;

          user.save((err, result) => {
            if (result) res.json({ message: "Email verified successfully" });
            else res.json({ message: "Something went wrong" });
          });
        } else {
          res.json({ message: "Provided code does not match" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ errors: "Something went wrong. Please try later" });
  }
};

exports.verifyPhone = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { phone, code } = req.body;
    await User.findOne({ phone: phone, phone_verification_token: code }).then(
      async (user) => {
        if (user) {
          user.phone_verified = true;
          user.phone_verification_token = null;

          user.save((err, result) => {
            if (result) res.json({ message: "Phone verified successfully" });
            else res.json({ message: "Something went wrong" });
          });
        } else {
          res.json({ message: "Provided code does not match" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ errors: "Something went wrong. Please try later" });
  }
};

exports.validateUserRegister = (req, res, next) => {
  const { email, password, password_confirmation, name, phone } = req.body;
  if (!email || email.length === 0) {
    return res
      .status(400)
      .send({ status: "error", message: "email field cannot be blank" });
  }
  if (!password || password.length === 0) {
    return res
      .status(400)
      .send({ status: "error", message: "password field cannot be blank" });
  }
  if (!password_confirmation || password_confirmation.length === 0) {
    return res.status(400).send({
      status: "error",
      message: "password_confirmation field cannot be blank",
    });
  }
  if (password !== password_confirmation) {
    return res.status(400).send({
      status: "error",
      message: "passowrd doesn't match with password_confirmation",
    });
  }
  if (!phone || phone.length === 0) {
    return res
      .status(400)
      .send({ status: "error", message: "phone field cannot be blank" });
  }
  if (!phone.match(/^[-\s\./0-9]*$/)) {
    return res.status(400).send({
      status: "error",
      message: "phone must be in correct format",
    });
  }
  if (!name || name.length === 0) {
    return res
      .status(400)
      .send({ status: "error", message: "name field cannot be blank" });
  }
  if (
    !name.match(/^[a-zA-Z'\-\pL]+(?:(?! {2})[a-zA-Z'\-\pL ])*[a-zA-Z'\-\pL]+$/)
  ) {
    return res
      .status(400)
      .send({ status: "error", message: "name must be in correct format" });
  }
  next();
};

exports.validateAuth = (method) => {
  switch (method) {
    case "login":
      return [
        body("email")
          .custom((value) => {
            return User.exists({ email: value }).then((user) => {
              if (!user) {
                return Promise.reject("Provided E-mail does not register");
              }
            });
          })
          .notEmpty()
          .withMessage("Email field is required")
          .isEmail()
          .withMessage("Email should be in valid format"),
        body("password").exists().withMessage("Password field is required"),
      ];
    case "register":
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
        body("address.country")
          .notEmpty()
          .withMessage("Country Field is required"),
        body("address.province")
          .notEmpty()
          .withMessage("Province Field is required"),
        body("address.district")
          .notEmpty()
          .withMessage("District Field is required"),
        body("address.area").notEmpty().withMessage("Area Field is required"),
        body("address.landmark")
          .notEmpty()
          .withMessage("Landmark Field is required"),
      ];
    case "verifyEmail":
      return [
        body("email")
          .custom((value) => {
            return User.exists({ email: value }).then((user) => {
              if (!user) {
                return Promise.reject("Provided email does not exist");
              }
            });
          })
          .notEmpty()
          .withMessage("Email field is required")
          .isEmail()
          .withMessage("Email should be in valid format"),
        body("code").notEmpty().withMessage("Code is required"),
      ];
    case "verifyPhone":
      return [
        body("phone")
          .notEmpty()
          .withMessage("Phone field is required.")
          .custom((value) => {
            return User.exists({ phone: value }).then((user) => {
              if (!user) {
                return Promise.reject("Phone does not exist");
              }
            });
          }),
        body("code").notEmpty().withMessage("Code is required"),
      ];
  }
};

// Socila login
exports.checkFacebookToken = async (req, res, next) => {
  let response = {};
  try {
    const accessToken = req.body.accessToken;
    console.log("accessToken",accessToken)
    await axios
      .get(
        `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,picture.width(800).height(800),email`
      )
      .then(async (response) => {
        const userData = response.data;
        // verified
        // check if user exists
        // yes - log in
        // no - register
        // console.log("user data",userData)        let user = await User.findOne({ email: userData.email });
        if (user) {
          await User.updateOne({
            email: userData.email,
        }, { profile_pic: userData.picture.data.url }, { new: true });
          user.profile_pic = userData.picture.data.url
          req.user = user;
          next();
          return;
        } else {
          const picture = userData.picture.data.url;
            const user = await new User({
              name: userData.name,
              email: userData.email,
              signup_source: "Facebook",
              profile_pic:picture,
              is_verified:true,
              is_active:true
            });
            await user.save();
            req.user = user;
            next();
            return;
          }      })
      .catch(error => {
        console.log('axios error', error);
      });
  } catch (e) {
    console.log("Error while verifying fb access token", e);
    response = {
      status: "error",
      error: e.message,
    };
    res.json(response);
    return;
  }
}// Google login
exports.checkGoogleToken = async (req, res, next) => {
  let response = {};
  try {
    const { accessToken } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENTID);
    const ticket = await client.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENTID
    });
    const payload = ticket.getPayload();
    const { name, picture, email, sub } = payload;
    const user = await User.findOne({ email });
    if (user) {
      await User.updateOne({
        email: userData.email,
    }, { profile_pic: userData.picture.data.url }, { new: true });
      user.profile_pic = picture
      req.user = user;
      next();
      return;
    } else {
        let user = await new User({
          name,
          email,
          profile_pic: picture,
          signup_source: "Google",
          is_verified:true,
          is_active:true
        });
        await user.save();
        req.user = user;
        next();
        return;    }
  } catch (e) {
    console.log('Error while verifying Google token', e);
    response = {
      status: 'error',
      error: e.message
    };
    res.json(response);
    return;
  }
}

exports.sendToken = (req, res) => {
  var result = {
    name: req.user.name,
    slug: req.user.slug,
    email: req.user.email,
    mobile_num: req.user.mobile_num,
    id: req.user._id,
    profile_pic: req.user.profile_pic,
    address: req.user.address,
  };

  res.json({
    status: "success",
    token: getToken(req.user),
    user: result,
  });
};
