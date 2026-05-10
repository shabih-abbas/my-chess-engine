import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import cookie from 'cookie'; // You'll need to: npm install cookie

export default async function socketProtect(socket, next){
  try {
    const cookieString = socket.handshake.headers.cookie;
    
    if (!cookieString) {
      return next(new Error('Not authorized, no token'));
    }

    const cookies = cookie.parse(cookieString);
    const token = cookies.jwt;

    if (!token) {
      return next(new Error('Not authorized, token missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket Auth Error:', error.message);
    next(new Error('Not authorized, token failed'));
  }
};

export async function getAuthenticatedUser(socket) {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.jwt;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-passwordHash");
    return user;
  } catch (error) {
    return null;
  }
}
