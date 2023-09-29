const dotenv = require('dotenv');
const express = require('express');
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('./model/User');
const UserService = require('./service/UserService');

// config .env
dotenv.config();

const app = express();

// settingup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser);

const userService = new UserService();

app.post('/login', (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  const userObject = userService.getUserByUsername(username);

  if (username === userObject.username && password === userObject.password) {
    accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    accessRefreshSecret = process.env.REFRESH_TOKEN_SECRET;

    //  Access Token
    const accessToken = jwt.sign(
      {
        username: userObject.username,
        emailmail: userObject.email,
      },
      accessTokenSecret,
      {
        expiresIn: '10m',
      }
    );

    // Refresh token
    const refreshToken = jwt.sign(
      {
        username: userObject.username,
      },
      accessRefreshSecret,
      {
        expiresIn: '1d',
      }
    );

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: false,
      maxAge: 12 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } else {
    res.status(406).json({ message: 'Invalid Credentials' });
  }
});

app.post('/refresh', (req, res) => {
  const { username } = req.body;

  if (req.cookies?.jwt) {
    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.jwt;

    const userObject = userService.getUserByUsername(username);
    if (userObject === 'undefined') {
      return res.status(406).json({ message: 'User does not exist' });
    }

    // Verifying refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          // Wrong Refesh Token
          return res.status(406).json({ message: 'Unauthorized' });
        } else {
          // Correct token we send a new access token
          const accessToken = jwt.sign(
            {
              username: userObject.username,
              email: userObject.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: '10m',
            }
          );
          return res.json({ accessToken });
        }
      }
    );
  } else {
    return res.status(406).json({ message: 'Unauthorized' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server active on http://localhost:${process.env.PORT}!`);
});
