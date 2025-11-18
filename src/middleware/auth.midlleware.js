/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Access token not found!' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    console.log("Decoded token:", decoded);
    console.log("req.user after set:", req.user);

    next();
    
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token!' });
  }
};
