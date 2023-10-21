const express = require("express");
const User = require("../models/user.model"); // Import your user model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");
const userAuth = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");
const sgMail = require("@sendgrid/mail");
const Assignment = require("../models/assignment.model");

const router = express.Router();

// Function to generate a numeric referral code
function generateNumericReferralCode() {
  const code = shortid.generate();
  return code;
}

// Route to register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const referralCode = generateNumericReferralCode();

    const user = new User({
      email,
      password,
      name,
      referralCode,
    });

    await user.save();

    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to log in an existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Route to log out the current user (requires authentication)
router.get("/logout/user", userAuth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send("User logged out successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route for admin logout
router.get("/logout/admin", adminAuth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send("Admin logged out successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to get user data
router.get("/myData", userAuth, async (req, res) => {
  try {
    res.send({ user: req.user });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to check referral code
router.post("/checkReferralCode", adminAuth, async (req, res) => {
  const { referralCode } = req.body;

  try {
    const user = await User.findOne({ referralCode });

    if (user) {
      return res.json({ exists: true, user });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// route to add amount
router.post("/addAmount", adminAuth, async (req, res) => {
  const { amountToAdd, referralCode } = req.body;

  try {
    const user = await User.findOne({ referralCode });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.amount += amountToAdd;
    await user.save();

    return res.json({ message: "Amount added successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to send withdrawal email
router.get("/withdrawAmount", userAuth, async (req, res) => {
  try {
    console.log();
    sgMail.setApiKey(process.env.SENDGRID_APIKEY);

    const msg = {
      to: req.user.email,
      from: "ansh@harsiddhitech.com",
      subject: "Withdrawal Request",
      text: `Your withdrawl request for ${req.user.amount} has been successfully placed.`,
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const adminMsg = {
      to: "emailforwork.ansh@gmail.com",
      from: "ansh@harsiddhitech.com",
      subject: "Withdrawal Request",
      text: `${req.user.name} (Referral Code: ${req.user.referralCode}) has sent a withdrawl request for ${req.user.amount}.`,
    };

    sgMail
      .send(adminMsg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    return res.json({ message: "Amount withdrawn successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get user data using referral code
router.post("/getUserByReferral", adminAuth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const user = await User.findOne({ referralCode });

    res.send({ user: user });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route to approve withdrawal code
router.post("/approveWithdrawal", adminAuth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const user = await User.findOne({ referralCode });

    user.total_earnings += user.amount;
    user.amount = 0;
    await user.save();

    const assignments = await Assignment.updateMany(
      { referralCode },
      { completed: true }
    );

    res.send({ user, assignments });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
