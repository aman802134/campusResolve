import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/token-creator';
import { AuthRequest } from '../types/request';
import { config } from '../config/config';
import { SuperAdminModel } from '../models/super-admin.model';
import { ApiError } from '../utils/api-error';
import { DecodedToken } from '../types/auth.payload';

export const superAdminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await SuperAdminModel.findOne({ email });

    if (!user) {
      throw new ApiError(401, 'Email not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Password is incorrect');
    }

    const jwtPayload = {
      userId: user._id?.toString?.() || '',
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);
    // Set HTTP-only secure cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      // sameSite: 'none',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      // sameSite: 'none',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Auth response
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
      },
    });
  } catch (err: any) {
    console.error('Error during login:', err.message || err);
    next(err);
  }
};

export const superAdminLogout = (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const superAdminAuthMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, 'token not found ! please login again');
    }
    const decoded = jwt.verify(token, config.jwt.accessSecret!) as DecodedToken;
    // if (typeof decoded === 'string') {
    //   throw new ApiError(401, 'Invalid token format');
    // }
    const user = await SuperAdminModel.findById(decoded.userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    console.error('erro while logging Admin:');
    console.error(err.message || err);
    next(err);
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log('user token refreshded successfully , reqeust reached');
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret!) as DecodedToken;

    // Check decoded content and regenerate access token
    if (!decoded || !decoded.userId || !decoded.role) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token payload' });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role, campus: decoded.campus },
      config.jwt.accessSecret!,
      { expiresIn: '5m' },
    );

    // Set new access token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      // sameSite: 'none',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({ success: true, message: 'Access token refreshed' });
  } catch (err) {
    console.error('Error refreshing token:', err);
    return res.status(500).json({ success: false, message: 'Server error while refreshing token' });
  }
};
