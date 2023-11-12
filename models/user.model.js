const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    // name
    name: {
      type: String,
    },
    // password stored in hash form
    password: {
      type: String,
    },
    // email assosciated
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: Number,
      required: true,
    },
    referralCode: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      default: 0,
    },

    admin: {
      type: Boolean,
      default: false,
    },

    total_earnings: {
      type: Number,
      default: 0,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// generates authentication token and stores it and then updates the document

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// deletes password, token and otp from user document when sending the response.
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

// hashes the password as we cannot store plain text password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
