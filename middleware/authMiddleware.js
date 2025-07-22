// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stackit_secret'); // fallback if .env not set

    // 🔥 Fetch full user details from DB
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // ✅ Attach user to request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error('Token error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

