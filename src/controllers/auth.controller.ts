import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { Request, Response, NextFunction } from 'express';
import { Jwt_Payload, LoginType, RegisterType } from '../types/auth.payload';
import { generateAccessToken, generateRefreshToken } from '../utils/token-creator';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload: RegisterType = req.body;
    if (!payload) {
      throw new ApiError(401, 'please provide neccessary field');
    }
    const existUser = await UserModel.findOne({ email: payload.email });
    if (existUser) {
      throw new ApiError(400, 'user already exist with this email');
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = UserModel.create({
      ...payload,
      password: hashedPassword,
    });
    res.status(201).json({ message: 'user created successfully' });
    return user;
  } catch (error) {
    throw new ApiError(500, 'internal server error');
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const payload: LoginType = req.body;
  const user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw new ApiError(401, 'user not found , register first..');
  }
  const matchPass = await bcrypt.compare(payload.password, user.password);
  if (!matchPass) {
    throw new ApiError(400, 'password not matched');
  }
  const jwtPayload: Jwt_Payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      campus: user.campus,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'logged out successfully' });
};
