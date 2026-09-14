import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_flashseat_key_12345', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

/**
 * Automatically creates default user accounts (demo and admin)
 * if they do not exist in the database.
 */
const ensureDefaultUsers = async () => {
  try {
    const demoUserExists = await User.findOne({ email: 'demo@example.com' });
    if (!demoUserExists) {
      console.log('🌱 Auto-seeding default demo user (demo@example.com)...');
      const salt = await bcrypt.genSalt(10);
      const userPasswordHash = await bcrypt.hash('user123', salt);
      await User.create({
        _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890124'),
        name: 'Demo User',
        email: 'demo@example.com',
        passwordHash: userPasswordHash,
        role: 'USER',
      });
    }

    const adminUserExists = await User.findOne({ email: 'admin@flashseat.com' });
    if (!adminUserExists) {
      console.log('🌱 Auto-seeding default admin user (admin@flashseat.com)...');
      const salt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash('admin123', salt);
      await User.create({
        _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890123'),
        name: 'Admin User',
        email: 'admin@flashseat.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      });
    }
  } catch (error) {
    console.error('❌ Auto-seeding users failed:', error);
  }
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password } = req.body;
  await ensureDefaultUsers();

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'USER', // Default role is USER
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error: any) {
    console.error('❌ Register User Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  await ensureDefaultUsers();

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error: any) {
    console.error('❌ Login User Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }
    return res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error: any) {
    console.error('❌ Get User Profile Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
