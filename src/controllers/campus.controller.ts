// controllers/campus.controller.ts
import { NextFunction, Request, Response } from 'express';
import { CampusModel } from '../models/campus.model';
import { CreateCampusPayload, UpdateCampusPayload } from '../types/campus.types';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import mongoose from 'mongoose';

/**
 * @desc Create a new campus
 * @access super_admin only
 */
export const createCampus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'super_admin') {
      throw new ApiError(403, 'Only super admin can perform this action');
    }

    const { name, location, campusCode, adminIds = [] }: CreateCampusPayload = req.body;

    if (!name || !location || !campusCode) {
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
      location,
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
    const { name, location, campusCode, adminIds }: UpdateCampusPayload = req.body;

    const campus = await CampusModel.findById(campusId);
    if (!campus) {
      throw new ApiError(404, 'Campus not found');
    }

    if (name) campus.name = name;
    if (location) campus.location = location;
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
