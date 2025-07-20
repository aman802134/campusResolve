// controllers/admin.controller.ts

import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { ROLE_REQUEST_STATUS, USER_ROLES, USER_STATUS } from '../types/enums';
import { CampusModel } from '../models/campus.model';
import { DepartmentModel } from '../models/department.model';

export const approveRequestedRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if(!user.requestedRole){
      throw new ApiError(400, 'User has not requested any role');
    }
    // Prevent assigning super_admin via request
    if (user.requestedRole === USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(403, 'Cannot assign super_admin via request');
    }

    // Role-specific required field validation
    if ([USER_ROLES.DEPARTMENT_ADMIN, USER_ROLES.STUDENT, USER_ROLES.FACULTY_ACADEMIC, USER_ROLES.FACULTY_NON_ACADEMIC].includes(user.requestedRole)) {
      if (!user.department) {
        throw new ApiError(400, `Cannot assign role ${user.requestedRole}: department is missing.`);
      }
    }
    if (user.requestedRole === USER_ROLES.CAMPUS_ADMIN) {
      if (!user.campus) {
        throw new ApiError(400, 'Cannot assign campus_admin: campus is missing.');
      }
    }

    user.role = user.requestedRole;
    user.requestedRole = undefined;
    user.status = USER_STATUS.ACTIVE;
    user.roleRequestStatus = ROLE_REQUEST_STATUS.APPROVED;
    await user.save();

    if (user.role === USER_ROLES.CAMPUS_ADMIN && user.campus) {
      await CampusModel.findByIdAndUpdate(
        user.campus,
        { $addToSet: { admins: user._id } }, // $addToSet avoids duplicates
        { new: true }
      );
    }
    if (user.role === USER_ROLES.DEPARTMENT_ADMIN && user.department) {
      await DepartmentModel.findByIdAndUpdate(
        user.department,
        { $Set: { admin: user._id } }, // $addToSet avoids duplicates
        { new: true }
      );
    }
    res.status(200).json({
      success: true,
      message: `User role approved and updated to ${user.role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a user’s requested role
 * PATCH /api/admin/reject-role/:userId
 */
export const rejectRequestedRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (!user.requestedRole) {
      throw new ApiError(400, 'User has not requested any role');
    }

    user.requestedRole = undefined;
    user.status = USER_STATUS.PENDING;
    user.roleRequestStatus = ROLE_REQUEST_STATUS.REJECTED;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role request rejected successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPendingRoleRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingUsers = await UserModel.find({ roleRequestStatus: ROLE_REQUEST_STATUS.PENDING });
    res.status(200).json({
      success: true,
      message: 'Fetched all users with pending role requests',
      data: pendingUsers,
    });
  } catch (error) {
    next(error);
  }
};
