const { User } = require('../models');
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');

/* 'authenticateLogin' middleware to use the 'Authorization' header and run username and password by the database to see if the user 
   is stored and password is valid, then setting property of 'currentUser' to the request object to use in routes */
module.exports = async (req, res, next) => {
  const userLogin = auth(req);
  console.log(userLogin);
  let authenticated = false;

  if (userLogin) {
    const user = await User.findOne({ where: { emailAddress: userLogin.name.toLowerCase() } }); 
    // set userLogin.name(email) to lowercase to make the login username/email case insensitive, like most logins are
    if (user) {
      authenticated = bcrypt
        .compareSync(userLogin.pass, user.password); // Sets 'authenticated' to true 
      if (authenticated) {
        // Store the user on the Request object
        req.currentUser = user;
      }
    }
  }

  // If the user didn't pass, send status code and message
  if (!authenticated) {
    res.status(401).json({ message: ['Access Denied:', 'Wrong email and/or password'] });
  } else {
    next();
  }
};