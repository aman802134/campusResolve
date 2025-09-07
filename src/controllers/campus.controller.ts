// controllers/campus.controller.ts
import { NextFunction, Request, Response } from 'express';
import { CampusModel } from '../models/campus.model';
import { CreateCampusPayload, UpdateCampusPayload } from '../types/campus.types';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import mongoose, { Types } from 'mongoose';
import { UserModel } from '../models/user.model';

/**
 * @desc Create a new campus
 * @access super_admin only
 */
export const createCampus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can perform this action');
    }

    const {
      name,
      address,
      city,
      state,
      pinCode,
      campusCode,
      adminIds = [],
    }: CreateCampusPayload = req.body;

    if (!name || !address || !campusCode) {
      throw new ApiError(400, 'Name, location and campusCode are required');
    }

    const existing = await CampusModel.findOne({
      $or: [{ name }, { campusCode }],
    });

    if (existing) {
      throw new ApiError(409, 'Campus with this name or code already exists');
    }

    const campus = await CampusModel.create({
      name,
      address,
      city,
      state,
      pinCode,
      campusCode,
      admins: adminIds.map((id) => new mongoose.Types.ObjectId(id)),
    });

    res.status(201).json({
      success: true,
      message: 'Campus created successfully',
      data: campus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update campus info
 * @access super_admin only
 */
export const updateCampus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can update campus');
    }

    const campusId = req.params.campusId;
    const { name, address, city, state, pinCode, campusCode, adminIds }: UpdateCampusPayload =
      req.body;

    const campus = await CampusModel.findById(campusId);
    if (!campus) {
      throw new ApiError(404, 'Campus not found');
    }

    if (name) campus.name = name;
    if (address) campus.address = address;
    if (city) campus.city = city;
    if (state) campus.state = state;
    if (pinCode) campus.pinCode = pinCode;
    if (campusCode) campus.campusCode = campusCode;
    if (adminIds) campus.admins = adminIds.map((id) => new mongoose.Types.ObjectId(id));

    await campus.save();

    res.status(200).json({
      success: true,
      message: 'Campus updated successfully',
      data: campus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all campuses
 * @access all authenticated users
 */
export const getAllCampuses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'super_admin') {
      throw new ApiError(403, 'you are not allowed to access the campuses');
    }
    const campuses = await CampusModel.find().populate('admins', 'name email');
    res.status(200).json({
      success: true,
      message: 'All campuses fetched successfully',
      data: campuses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get campus by ID
 * @access all authenticated users
 */
export const getCampusById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const campusId = req.params.campusId;
    if (!campusId) {
      throw new ApiError(400, 'Campus ID is required');
    }

    const campus = await CampusModel.findById(campusId).populate('admins', 'name email');
    if (!campus) {
      throw new ApiError(404, 'Campus not found');
    }

    res.status(200).json({
      success: true,
      message: 'Campus fetched successfully',
      data: campus,
    });
  } catch (error) {
    next(error);
  }
};

export const assignAdminToCampus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can perform this action');
    }

    const { campusId, adminId } = req.body as { campusId: string; adminId: string };

    if (!mongoose.Types.ObjectId.isValid(campusId) || !mongoose.Types.ObjectId.isValid(adminId)) {
      throw new ApiError(400, 'Invalid campusId or adminId');
    }

    const campus = await CampusModel.findById(campusId).populate('admins');
    if (!campus) {
      throw new ApiError(404, 'Campus not found');
    }

    const admin = await UserModel.findById(adminId);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    // 1. Check if admin is already assigned to ANY campus
    const alreadyAssignedCampus = await CampusModel.findOne({ admins: admin._id });
    if (alreadyAssignedCampus) {
      if (alreadyAssignedCampus._id === campusId) {
        // Admin already belongs to this campus
        return res.status(200).json({
          success: true,
          message: 'Admin is already assigned to this campus',
          campus,
        });
      } else {
        // Admin belongs to another campus
        throw new ApiError(
          400,
          `Admin is already assigned to campus: ${alreadyAssignedCampus.name}`,
        );
      }
    }

    // 2. If admin not already assigned anywhere, add to this campus
    if (!campus.admins?.some((id) => id.toString() === admin._id)) {
      campus.admins?.push(admin._id as Types.ObjectId);
      await campus.save();
    }

    return res.status(200).json({
      success: true,
      message: `Admin ${admin.name} assigned to campus ${campus.name}`,
      campus,
    });
  } catch (err) {
    next(err);
  }
};
