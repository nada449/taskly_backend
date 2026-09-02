const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // splits "Bearer xyz" into ["Bearer", "xyz"], takes the token part

  if (!token) {
    return res.status(401).json({ message: 'Malformed authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    req.user = decoded; // makes { userId: '...' } available in every controller from here on
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = verifyToken;