import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import { USER_ROLES } from '../types/enums';
import mongoose from 'mongoose';
import { CreateAdmin, UpdateAdmin } from '../types/admin.payload';
import { AdminVerificationModel } from '../models/admin.-verification.model';

export const createAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(403, 'only super admin can create the users!');
    }

    const { name, email, externalId, campus, role, gender, phone }: CreateAdmin = req.body;
    if (!externalId || !name || !email || !role || !campus || !gender || !phone) {
      throw new ApiError(400, 'Please fill all required field');
    }
    const existingUser = await AdminVerificationModel.findOne({ email });
    if (existingUser) {
      throw new ApiError(403, 'user already exists in db');
    }
    const Admin = await AdminVerificationModel.create({
      name,
      email,
      externalId,
      campus,
      role,
      gender,
      phone,
    });
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: Admin,
    });
  } catch (error) {
    next(error);
  }
};
export const getAdmins = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const Admins = await AdminVerificationModel.find();
    res.status(200).json({ success: true, data: Admins });
  } catch (err) {
    next(err);
  }
};

export const updateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(403, 'only super admin can update user data');
    }
    const adminId = req.params.id;
    const admin = await AdminVerificationModel.findById(adminId);
    if (!admin) {
      throw new ApiError(400, 'adminId not found in the db');
    }

    const { name, email, externalId, campus, gender, phone }: UpdateAdmin = req.body;
    if (!externalId && !name && !email && !gender && !phone) {
      throw new ApiError(400, 'At least one field must be provided to update');
    }
    if (externalId) admin.externalId = externalId;
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (campus) admin.campus = new mongoose.Types.ObjectId(campus);
    if (gender) admin.gender = gender;
    if (phone) admin.phone = phone;
    const updatedAdmin = await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};
