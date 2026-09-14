import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface DecodedToken {
  id: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_flashseat_key_12345') as DecodedToken;

      // Find user from database
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found in system' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('❌ Token Verification Error:', error);
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ success: false, error: 'Not authorized as an admin' });
};
