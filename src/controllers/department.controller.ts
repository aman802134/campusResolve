// controllers/department.controller.ts
import { Response } from 'express';
import { DepartmentModel } from '../models/department.model';
import { CreateDepartmentPayload } from '../types/department.types';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import { USER_ROLES } from '../types/enums';
import mongoose from 'mongoose';

/**
 * @desc Create a new department
 * @access super_admin only
 */
export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== USER_ROLES.ADMIN) {
      throw new ApiError(403, 'Only super admin can create departments');
    }

    const {
      name,
      campus,
      departmentCode,
      adminId,
      domain = [],
    }: CreateDepartmentPayload = req.body;

    if (!name || !campus || !departmentCode) {
      throw new ApiError(400, 'Department name, campus, and departmentCode are required');
    }

    const existing = await DepartmentModel.findOne({
      name: name,
      campus: campus,
    });

    const existingCode = await DepartmentModel.findOne({
      departmentCode: departmentCode,
      campus: campus,
    });

    if (existing || existingCode) {
      throw new ApiError(409, 'Department with this name or code already exists in this campus');
    }

    const departmentData = {
      name,
      departmentCode,
      domain,
      campus: new mongoose.Types.ObjectId(campus),
      ...(adminId && { admin: new mongoose.Types.ObjectId(adminId) }),
    };

    const department = await DepartmentModel.create(departmentData);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Department creation failed',
      error: error.message,
    });
  }
};

/**
 * @desc Get all departments
 * @access authenticated users
 */
export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await DepartmentModel.find()
      .populate('admin', 'name email')
      .populate('campus', 'name campusCode');
    res.status(200).json({
      success: true,
      message: 'Departments fetched successfully',
      data: departments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Department fetching failed',
      error: error.message,
    });
  }
};

/**
 * @desc Get a department by ID
 * @access authenticated users
 */
export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const departmentId = req.params.departmentId;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new ApiError(400, 'Invalid department ID');
    }

    const department = await DepartmentModel.findById(departmentId)
      .populate('admin', 'name email')
      .populate('campus', 'name campusCode');

    if (!department) {
      throw new ApiError(404, 'Department not found');
    }

    res.status(200).json({
      success: true,
      message: 'Department fetched successfully',
      data: department,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Department fetching failed',
      error: error.message,
    });
  }
};

/**
 * @desc Update department domain list
 * @access campus_admin or department_admin (own department/campus only)
 */
export const updateDomain = async (req: AuthRequest, res: Response) => {
  try {
    const departmentId = req.params.departmentId;
    const { domain } = req.body;

    if (!Array.isArray(domain) || domain.length === 0) {
      throw new ApiError(400, 'Invalid or missing domain list');
    }

    const department = await DepartmentModel.findById(departmentId).populate('campus');
    if (!department) {
      throw new ApiError(404, 'Department not found');
    }

    const user = req.user!;

    const isDeptHead =
      user.role === USER_ROLES.DEPARTMENT_HEAD && department.admin?.toString() === user.userId;

    const isCampusHead =
      user.role === USER_ROLES.CAMPUS_HEAD && department.campus?._id.toString() === user.campus;
    const isAdmin =
      user.role === USER_ROLES.ADMIN && department.campus?._id.toString() === user.campus;

    if (!isDeptHead && !isCampusHead && isAdmin) {
      throw new ApiError(403, 'You do not have permission to update department domains');
    }

    department.domain = domain;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department domain updated successfully',
      data: department,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update department domain',
      error: error.message,
    });
  }
};
