const joi = require('joi');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { ReasonPhrases, StatusCodes } = require('http-status-codes');
const user = require('../models/auth');

/**
 * Controller to handle signup requests.
 * @param {import('express').Request} req - Express request context
 * @param {import('express').Response} res - Express response context
 * @returns {Promise<void>} A promise which resolves once the function has finished
 */
const signup = async (req, res) => {
  const schema = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi
      .string()
      .pattern(new RegExp('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).{8,}$'))
      .required(),
  });

  const requestCredentials = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  const { error } = schema.validate(requestCredentials);
  if (error) {
    console.warn(
      `${new Date().toISOString()}: Signup attempt with invalid credentials`
    );
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ error: error.details[0].message });
  }

  try {
    const userByEmail = await user.getByEmail(requestCredentials.email);
    if (userByEmail) {
      throw new Error('User with this email alreay exists');
    }
    const userByUsername = await user.getByUsername(
      requestCredentials.username
    );
    if (userByUsername) {
      throw new Error('User with this username already exists');
    }
  } catch (error) {
    if (error.sqlMessage) {
      console.error(`[${new Date().toISOString()}] ${error.sqlMessage}`);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
    console.error(
      `[${new Date().toISOString()}] Attempted signup with a username or email that is already in use`
    );
    return res.status(StatusCodes.CONFLICT).send(error.message);
  }

  let passwordHash = '';
  try {
    passwordHash = await argon2.hash(requestCredentials.password);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }

  const newUser = {
    id: uuid(),
    username: requestCredentials.username,
    email: requestCredentials.email,
    password: passwordHash,
  };

  try {
    await user.create(newUser);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }

  // Create a JWT token
  const tokenPayload = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_KEY, {
    expiresIn: '5d',
  });

  console.log(
    `[${new Date().toISOString()}] New user signed up, ${newUser.email}`
  );

  return res
    .status(StatusCodes.OK)
    .send({ username: newUser.username, email: newUser.email, token });
};

/**
 * Checks the provided user credentials and generates a Json Web Token for the
 * user to authenticate with.
 * @param {import('express').Request} req - Request context
 * @param {import('express').Response} res - Response context
 */
const login = async (req, res) => {
  const schema = joi.object({
    username: joi.string().required(),
    password: joi
      .string()
      .pattern(new RegExp('^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).{8,}$'))
      .required(),
  });

  const requestCredentials = {
    username: req.body.username,
    password: req.body.password,
  };

  const { error } = schema.validate(requestCredentials);
  if (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ error: error.details[0].message });
  }

  let dbUser = null;
  try {
    dbUser = await user.getByUsernameOrEmail(requestCredentials.username);
  } catch (error) {
    console.error(`[${new Date().toISOString()}]`, error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }

  try {
    const passwordIsValid = await argon2.verify(
      dbUser.password,
      requestCredentials.password
    );
    if (passwordIsValid) {
      const tokenPayload = {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_KEY, {
        expiresIn: '5d',
      });
      console.log(
        `[${new Date().toISOString()}] Successful login to user ${dbUser.email}`
      );
      return res
        .status(StatusCodes.OK)
        .send({ username: dbUser.username, email: dbUser.email, token });
    } else {
      console.warn(
        `[${new Date().toISOString()}] Attempted login with invalid credentials to user ${dbUser.email}`
      );
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(ReasonPhrases.UNAUTHORIZED);
    }
  } catch (error) {
    console.error('Error while logging in us>er:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
};

module.exports = { signup, login };
