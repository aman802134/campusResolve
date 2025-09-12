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
    const requester = req.user;
    const query: any = {};

    query._id = { $ne: requester.userId };
    const users = await VerificationModel.find(query).populate('campus').populate('department');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getVerifiedUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only super_admin, campus_admin, department_admin, or faculty_academic can access
    const requester = req.user;
    const allowedRoles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN];
    if (!requester || !allowedRoles.includes(requester.role)) {
      throw new ApiError(403, 'Forbidden: You are not allowed to perform this action');
    }
    const userId = req.params.userId;
    if (!userId) {
      throw new ApiError(400, 'userId not found');
    }
    const user = await VerificationModel.findById(userId)
      .populate('campus')
      .populate('department')
      .lean();
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateVerificationUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role !== USER_ROLES.ADMIN && req.user?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(403, 'only  admins can update user data');
    }
    const userId = req.params.id;
    const user = await VerificationModel.findById(userId);
    if (!user) {
      throw new ApiError(400, 'userId not found in the db');
    }

    const { externalId, name, email, campus, department, role }: UpdateVerificationType = req.body;
    // if (!externalId || !name || !email || !campus || !department) {
    //   throw new ApiError(400, 'At least one field must be provided to update');
    // }
    const updates: any = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.role !== undefined) updates.role = req.body.role;
    if (req.body.campus !== undefined) updates.campus = req.body.campus;
    if (req.body.department !== undefined) updates.department = req.body.department;

    await VerificationModel.findByIdAndUpdate(userId, { $set: updates }, { new: true });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updates,
    });
  } catch (error) {
    next(error);
  }
};
