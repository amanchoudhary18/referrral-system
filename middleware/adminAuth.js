const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
require("dotenv").config();

const adminAuth = async (req, res, next) => {
  try {
    console.log(req.header("Authorization"));
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
      admin: true,
    });

    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ status: "Failed", message: "Please authenticate." });
  }
};

module.exports = adminAuth;
