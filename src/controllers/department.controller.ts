// controllers/department.controller.ts
import { NextFunction, Response } from 'express';
import { DepartmentModel } from '../models/department.model';
import { CreateDepartmentPayload } from '../types/department.types';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import { USER_ROLES } from '../types/enums';
import mongoose, { Types } from 'mongoose';
import { UserModel } from '../models/user.model';
import { departmentWithUserCountsPipeline } from '../aggregation-pipeline/department';

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

export const assignAdminToDepartment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role !== 'admin') {
      throw new ApiError(403, 'Only  admin can perform this action');
    }

    const { departmentId, adminId } = req.body as { departmentId: string; adminId: string };

    if (
      !mongoose.Types.ObjectId.isValid(departmentId) ||
      !mongoose.Types.ObjectId.isValid(adminId)
    ) {
      throw new ApiError(400, 'Invalid campusId or adminId');
    }

    const department = await DepartmentModel.findById(departmentId).populate('admin');
    if (!department) {
      throw new ApiError(404, 'Campus not found');
    }

    const admin = await UserModel.findById(adminId);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    // 1. Check if admin is already assigned to ANY campus
    const alreadyAssignedCampus = await DepartmentModel.findOne({ admins: admin._id });
    if (alreadyAssignedCampus) {
      if (alreadyAssignedCampus._id === departmentId) {
        // Admin already belongs to this campus
        return res.status(200).json({
          success: true,
          message: 'Admin is already assigned to this campus',
          department,
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
    if (!department.admin || department.admin.toString() !== admin._id) {
      department.admin = admin._id as Types.ObjectId;
      await department.save();
    }

    return res.status(200).json({
      success: true,
      message: `Admin ${admin.name} assigned to campus ${department.name}`,
      department,
    });
  } catch (err) {
    next(err);
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

    const isAdmin =
      user.role === USER_ROLES.ADMIN && department.campus?._id.toString() === user.campus;

    if (!isAdmin) {
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

// controllers/department.controller.ts

export const getDepartmentsWithCounts = async (req: AuthRequest, res: Response) => {
  try {
    // Decide campus filter based on user role
    let campusId = req.query.campusId as string;

    // Example: if logged-in user is admin, use their campus automatically:
    if (req.user?.role === USER_ROLES.ADMIN) {
      campusId = req.user.campus as string; // their campus
    }

    const pipeline = departmentWithUserCountsPipeline(campusId);

    const departments = await DepartmentModel.aggregate(pipeline);

    res.status(200).json({
      success: true,
      message: 'Departments with user counts fetched successfully',
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
