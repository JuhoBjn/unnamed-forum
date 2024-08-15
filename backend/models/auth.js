const pool = require('../db/pool');

/**
 * Object containing all the database models for interacting with user data.
 */
const user = {
  /**
   * Gets a user's info by their email address;
   * @param {string} email - Email address to query with
   * @returns {Promise<(Object | null)>} A promise which resolves to an array of users
   * @throws {Error} If the DB query fails
   */
  getByEmail: async (email) => {
    let connection = null;
    try {
      connection = await pool.getConnection();
      const query =
        'SELECT `id`,`username`,`email` FROM users WHERE email = ?;';
      const [rows] = await connection.query(query, [email]);
      connection.release();
      return rows[0] ?? null;
    } catch (error) {
      console.error('getUserByEmail:', error);
      if (connection) {
        connection.release();
      }
      throw error;
    }
  },

  /**
   * Gets a user's info by their username.
   * @param {string} username - Username to query with
   * @returns {Promise<(Object | null)>} A promise which resolves to an array of users
   * @throws {Error} If the DB query fails
   */
  getByUsername: async (username) => {
    let connection = null;
    try {
      connection = await pool.getConnection();
      const query =
        'SELECT `id`,`username`,`email` FROM users WHERE `username` = ?;';
      const [rows] = await connection.query(query, [username]);
      return rows[0] ?? null;
    } catch (error) {
      console.error('getUserByUsername:', error);
      if (connection) {
        connection.release();
      }
      throw error;
    }
  },

  /**
   * Gets a user's info by their username or email.
   * @param {string} username - Username to query with
   * @returns {Promise<(Object | null)>} A promise which resolves to a user if found, null if not found
   * @throws {Error} If the DB query fails
   */
  getByUsernameOrEmail: async (username) => {
    let connection = null;
    try {
      connection = await pool.getConnection();
      const query =
        'SELECT `id`, `username`, `email`, `password` FROM users WHERE `username` = ? OR `email` = ?;';
      const [rows] = await connection.query(query, [username, username]);
      return rows[0] ?? null;
    } catch (error) {
      console.error('get`ByUsernameOrEmail:', error);
      if (connection) {
        connection.release();
      }
      throw error;
    }
  },

  /**
   * Creates a new user in the database.
   * @param {User} user - The user to create
   * @param {string} user.id - UUID
   * @param {string} user.username - Username
   * @param {string} user.email - Email address
   * @param {string} user.password - Password hash
   * @returns {Promise<Object>} A promise which resolves to the created user
   * @throws {Error} If the query fails
   */
  create: async (user) => {
    let connection = null;
    try {
      connection = await pool.getConnection();
      const query =
        'INSERT INTO users(id, username, email, password) VALUES (?);';
      const [rows] = await connection.query(query, [
        [user.id, user.username, user.email, user.password],
      ]);
      connection.release();
      return rows[0];
    } catch (error) {
      console.error('createUser:', error);
      if (connection) {
        connection.release();
      }
      throw error;
    }
  },
};

module.exports = user;
