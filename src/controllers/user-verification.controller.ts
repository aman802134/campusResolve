import { VerificationModel } from '../models/verification.model';
import { UpdateVerificationType, VerificationType } from '../types/auth.payload';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import { USER_ROLES } from '../types/enums';
import mongoose from 'mongoose';

export const createVerificationUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role !== USER_ROLES.ADMIN) {
      throw new ApiError(403, 'only  admin can create the users!');
    }

    const { externalId, name, email, role, campus, department }: VerificationType = req.body;
    if (!externalId || !name || !email || !role || !campus || !department) {
      throw new ApiError(400, 'Please fill all required field');
    }
    const existingUser = await VerificationModel.findOne({ email });
    if (existingUser) {
      throw new ApiError(403, 'user already exists in db');
    }
    const verificationUser = await VerificationModel.create({
      externalId,
      name,
      email,
      role,
      campus,
      department,
    });
    res.status(201).json({
      success: true,
      message: 'user created successfully',
      data: verificationUser,
    });
  } catch (error) {
    next(error);
  }
};
export const getVerifiedUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'admin') {
      throw new ApiError(403, 'Not allowed ! only admin can fetch verified users');
    }
    const users = await VerificationModel.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const updateVerificationUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role !== USER_ROLES.ADMIN) {
      throw new ApiError(403, 'only  admin can update user data');
    }
    const userId = req.params.id;
    const user = await VerificationModel.findById(userId);
    if (!user) {
      throw new ApiError(400, 'userId not found in the db');
    }

    const { externalId, name, email, campus, department }: UpdateVerificationType = req.body;
    if (!externalId && !name && !email && !campus && !department) {
      throw new ApiError(400, 'At least one field must be provided to update');
    }
    if (externalId) user.externalId = externalId;
    if (name) user.name = name;
    if (email) user.email = email;
    if (campus) user.campus = new mongoose.Types.ObjectId(campus);
    if (department) user.department = new mongoose.Types.ObjectId(department);
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
