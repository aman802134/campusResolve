// controllers/department.controller.ts
import { Request, Response } from 'express';
import { DepartmentModel } from '../models/department.model';
import { CreateDepartmentPayload } from '../types/department.types';
import { ApiError } from '../utils/api-error';
import { AuthRequest } from '../types/request';
import { USER_ROLES } from '../types/enums';
import mongoose from 'mongoose';

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const payload: CreateDepartmentPayload = req.body;

    if (!payload.name || !payload.campus) {
      throw new ApiError(400, 'department and campus name missing');
    }
    const existing = await DepartmentModel.findOne({ name: payload.name });
    if (existing) {
      throw new ApiError(409, 'department already exists');
    }
    if (req.user!.role != USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(403, "you don't have permission to create department");
    }
    const departmentData: {
      name: string;
      domain?: string[];
      campus: mongoose.Types.ObjectId;
      admin?: mongoose.Types.ObjectId;
    } = {
      name: payload.name,
      campus: new mongoose.Types.ObjectId(payload.campus),
    };

    if (payload.adminId) {
      departmentData.admin = new mongoose.Types.ObjectId(payload.adminId);
    }

    await DepartmentModel.create(departmentData);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: departmentData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Department creation failed',
      error: error.message,
    });
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await DepartmentModel.find();
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
    
    const isDeptAdmin =
      user.role === USER_ROLES.DEPARTMENT_ADMIN && department.admin?.toString() === user.userId;
    const isCampusAdmin =
      user.role === USER_ROLES.CAMPUS_ADMIN && department.campus?._id.toString() === user.campus;

    if (!isDeptAdmin && !isCampusAdmin) {
      throw new ApiError(403, 'You do not have permission to update domains');
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
