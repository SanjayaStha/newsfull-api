require("dotenv").config();
const jwt = require("jsonwebtoken");
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
// verify loggedin user
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403).json({ message: "Invlid access token" });
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401).json({ message: "Unauthorized" });
  }
};
module.exports = authenticateJWT;
