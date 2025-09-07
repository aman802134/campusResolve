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
    const { externalId, name, email, role, campus, department }: VerificationType = req.body;

    // Validate required fields
    if (!externalId || !name || !email || !role || !campus) {
      throw new ApiError(400, 'Please fill all required fields');
    }

    // Role-based creation rules
    if (req.user?.role === USER_ROLES.SUPER_ADMIN) {
      if (role !== USER_ROLES.ADMIN) {
        throw new ApiError(403, 'Super-admin can only verify admins');
      }
    } else if (req.user?.role === USER_ROLES.ADMIN) {
      if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN) {
        throw new ApiError(403, 'Admins cannot verify other admins or super-admins');
      }
    } else {
      throw new ApiError(403, 'Only admins or super-admins can create verified users');
    }

    // Prevent duplicates
    const existingUser = await VerificationModel.findOne({ email });
    if (existingUser) {
      throw new ApiError(403, 'User already exists in db');
    }

    // Create verification entry
    const verificationUser = await VerificationModel.create({
      externalId,
      name,
      email,
      role,
      campus: new mongoose.Types.ObjectId(campus),
      department: department ? new mongoose.Types.ObjectId(department) : undefined,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: verificationUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getVerifiedUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== USER_ROLES.ADMIN && req.user?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(403, 'Not allowed! Only admin or super-admin can fetch verified users');
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
