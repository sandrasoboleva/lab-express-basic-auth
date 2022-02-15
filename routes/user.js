var express = require("express");
const req = require("express/lib/request");
var router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const saltRounds = 10;

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post("/signup", function (req, res, next) {
  let errors = [];

  if (!req.body.username) {
    errors.push("You did not include a name!");
  }
  if (!req.body.password) {
    errors.push("You need a password");
  }

  if (errors.length > 0) {
    res.json(errors);
  }
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPass = bcrypt.hashSync(req.body.password, salt);

  User.create({
    username: req.body.username,
    password: hashedPass,
  })
    .then((createdUser) => {
      console.log("User was created", createdUser);
      res.render("profile", {name:req.session.user.username})
    })
    .catch((err) => {
      console.log("Something went wrong", err.errors);
      res.json(err);
    });
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/login", (req, res) => {
  let errors = [];

  if (!req.body.username) {
    errors.push("You did not include a name!");
  }
  if (!req.body.password) {
    errors.push("You need a password");
  }
  if (errors.length > 0) {
    res.json(errors);
  }


  User.findOne({ username: req.body.username })
    .then((foundUser) => {
      if (!foundUser) {
        return res.json("Username not found");
      }
      const match = bcrypt.compareSync(req.body.password, foundUser.password);
      if (!match) {
        return res.json("Incorrect password");
      }

      req.session.user = foundUser;

      console.log(req.session.user);
      res.render("profile", {name:req.session.user.username});
     
    })
    .catch((err) => {
      console.log("Something went wrong", err);
      res.json(err);
    });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  console.log("This is the session", req.session);
  res.json("you have logged out");
});
module.exports = router;

// const match = bcrypt.compareSync("password", hashedPass);