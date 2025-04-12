require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");

let User;

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    const uri = process.env.MONGODB;
    if (!uri) {
      return reject("MongoDB URI is undefined.");
    }

    const db = mongoose.createConnection(uri);

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return;
    }

    bcrypt.hash(userData.password, 10).then((hash) => {
      userData.password = hash;
      delete userData.password2;

      const newUser = new User({
        userName: userData.userName,
        password: userData.password,
        email: userData.email,
        loginHistory: [],
      });

      newUser.save()
        .then(() => resolve())
        .catch((err) => {
          if (err.code === 11000) {
            reject("User Name already taken");
          } else {
            reject("There was an error creating the user: " + err);
          }
        });

    }).catch(() => {
      reject("There was an error encrypting the password");
    });
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .then((users) => {
        if (users.length === 0) {
          reject("Unable to find user: " + userData.userName);
          return;
        }

        bcrypt.compare(userData.password, users[0].password).then((result) => {
          if (!result) {
            reject("Incorrect Password for user: " + userData.userName);
            return;
          }

          if (users[0].loginHistory.length === 8) {
            users[0].loginHistory.pop();
          }

          users[0].loginHistory.unshift({
            dateTime: new Date().toString(),
            userAgent: userData.userAgent,
          });

          User.updateOne(
            { userName: users[0].userName },
            { $set: { loginHistory: users[0].loginHistory } }
          )
            .then(() => {
              resolve(users[0]);
            })
            .catch((err) => {
              reject("There was an error verifying the user: " + err);
            });

        }).catch(() => {
          reject("There was an error comparing passwords");
        });
      })
      .catch(() => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};

if (require.main === module) {
  module.exports.initialize()
    .then(() => {
      console.log("✅ MongoDB connection successful!");
      process.exit();
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err);
      process.exit();
    });
}
