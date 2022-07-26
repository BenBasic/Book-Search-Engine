const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    /* If there is a req.headers.authorization, assign the token to equal it's current value but
    split it based on every space character, then returning the last element of that array,
    and them trimming all empty space within that element
    */
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // If there is no token, then return the request
    if (!token) {
      return req;
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    // Returning the request object, this will later be passed into the resolver
    return req;
  },
  // signToken function which will have username, email, and id passed into it
  signToken: function ({ username, email, _id }) {
    // Assigning the payload to the username, email and id
    const payload = { username, email, _id };
    /* Returns the signed json web token with the data assigned to the payload values,
    then includes our secret value, and assigns the expiresIn to our expiration value
    */
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
