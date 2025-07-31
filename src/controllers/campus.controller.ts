// controllers/campus.controller.ts
import { NextFunction, Request, Response } from 'express';
import { CampusModel } from '../models/campus.model';
import { CreateCampusPayload } from '../types/campus.types';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';

export const createCampus = async (req: AuthRequest, res: Response) => {
  try {
    const payload: CreateCampusPayload = req.body;

    if (!payload.name || !payload.location) {
      throw new ApiError(400, 'Campus name and location are required');
    }

    const existing = await CampusModel.findOne({ name: payload.name });
    if (existing) {
      throw new ApiError(409, 'Campus already exists');
    }
    if (req.user!.role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can perform this action');
    }

    const campus = await CampusModel.create({
      name: payload.name,
      location: payload.location,
      admins: payload.adminIds || [],
    });

    res.status(201).json({
      success: true,
      message: 'Campus created successfully',
      data: campus,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Campus creation failed',
      error: error.message,
    });
  }
};
// controllers/campus.controller.ts
export const updateCampus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const campusId = req.params.campusId;
    const { name, location, adminIds } = req.body;
    if (req.user!.role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can update campus');
    }
    const campus = await CampusModel.findById(campusId);
    if (!campus) {
      throw new ApiError(404, 'Campus not found');
    }
    if (name) campus.name = name;
    if (location) campus.location = location;
    if (adminIds) campus.admins = adminIds;
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
export const getAllCampuses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
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
