// controllers/auth.controller.ts
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { RegisterType, LoginType, AuthResponse, JwtPayload } from '../types/auth.payload';
import { generateAccessToken, generateRefreshToken } from '../utils/token-creator';
import { ROLE_REQUEST_STATUS, USER_ROLES, USER_STATUS } from '../types/enums';
import { AuthRequest } from '../types/request';
import uploadImage from '../cloudinary/cloudinary';
import { registerSchema } from '../validations/auth-schema.validation';
import { requestRoleSchema } from '../validations/request-role-validation';
import mongoose from 'mongoose';
/**
 * @desc Register a new user
 */
export const register = async (
  req: Request<{}, {}, RegisterType>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const payload = parsed.data;

    // Handle avatar upload
    let avatarUrl = payload.avatarUrl;
    if (req.file?.path) {
      avatarUrl = req.file.path;
    }

    if (!avatarUrl) {
      return res.status(400).json({ error: 'No avatar file uploaded or URL provided' });
    }

    const uploadResult = await uploadImage(avatarUrl);
    if (!uploadResult || uploadResult.msg) {
      throw new ApiError(500, 'Image upload failed: ' + (uploadResult.msg || 'Unknown error'));
    }

    const imageUrl = uploadResult.url;

    const existing = await UserModel.findOne({ email: payload.email });
    if (existing) {
      throw new ApiError(409, 'Email already in use');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const newUser = await UserModel.create({
      ...payload,
      avatarUrl: imageUrl,
      password: hashedPassword,
      role: USER_ROLES.STUDENT, // 🔐 Only assign student by default
      roleRequestStatus: null,
      requestedRole: null,
      status: USER_STATUS.PENDING,
      verified: false,
      isBanned: false,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: newUser._id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Request Role Change (after registration)
 */
export const requestRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = requestRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { requestedRole, campus, department } = parsed.data;

    if (requestedRole === USER_ROLES.SUPER_ADMIN || requestedRole === USER_ROLES.STUDENT) {
      throw new ApiError(400, 'Invalid role request');
    }
    // Enforce extra info based on requestedRole
    if (requestedRole === USER_ROLES.CAMPUS_ADMIN && !campus) {
      throw new ApiError(400, 'Campus is required when requesting campus_admin role');
    }

    if (requestedRole === USER_ROLES.DEPARTMENT_ADMIN) {
      if (!department) {
        throw new ApiError(400, 'Department is required when requesting department_admin role');
      }
      if (!campus) {
        throw new ApiError(400, 'Campus is required when requesting department_admin role');
      }
    }

    const user = await UserModel.findById(req.user?.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.roleRequestStatus === ROLE_REQUEST_STATUS.PENDING) {
      throw new ApiError(400, 'Role request already pending');
    }

    user.requestedRole = requestedRole;
    user.roleRequestStatus = ROLE_REQUEST_STATUS.PENDING;

    // Assign campus or department if necessary
    if (requestedRole === USER_ROLES.CAMPUS_ADMIN) {
      user.campus = new mongoose.Types.ObjectId(campus);
    }
    if (requestedRole === USER_ROLES.DEPARTMENT_ADMIN) {
      user.department = new mongoose.Types.ObjectId(department);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Role request submitted successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only super_admin, campus_admin, department_admin, or faculty_academic can access
    const requester = req.user;
    const allowedRoles = [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.CAMPUS_ADMIN,
      USER_ROLES.DEPARTMENT_ADMIN,
      USER_ROLES.FACULTY_ACADEMIC,
    ];
    if (!requester || !allowedRoles.includes(requester.role)) {
      throw new ApiError(403, 'Forbidden: You are not allowed to perform this action');
    }
    const userId = req.params.userId;
    if (!userId) {
      throw new ApiError(400, 'userId not found');
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    // Only super_admin can fetch any user; others must match campus
    if (
      requester.role !== 'super_admin' &&
      (!user.campus || !requester.campus || user.campus.toString() !== requester.campus.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You can only access users from your own campus');
    }
    // Department admin can only fetch users from their own department
    if (
      requester.role === 'department_admin' &&
      (!user.department ||
        !requester.department ||
        user.department.toString() !== requester.department.toString())
    ) {
      throw new ApiError(403, 'Forbidden: You can only access users from your own department');
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginType>,
  res: Response<AuthResponse>,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      throw new ApiError(401, 'email not found');
    }
    if (user.isBanned) {
      throw new ApiError(403, 'Your account is banned');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new ApiError(401, 'password not matched');
    }

    // Build JWT payload with all relevant claims
    const jwtPayload: JwtPayload = {
      userId: user._id?.toString?.() || '',
      role: user.role,
      email: user.email,
      name: user.name,
      requestedRole: user.requestedRole,
      campus: user.campus ? user.campus.toString() : undefined,
      department: user.department ? user.department.toString() : undefined,
      status: user.status,
      verified: user.verified,
      isBanned: user.isBanned,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Set secure cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Response body mirrors your AuthResponse.user interface
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id as string,
        name: user.name,
        email: user.email,
        role: user.role,
        campus: user.campus ? user.campus.toString() : '',
        department: user.department ? user.department.toString() : undefined,
        phone: user.phone,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        status: user.status,
        verified: user.verified,
        isBanned: user.isBanned,
      },
    });
  } catch (err: any) {
    console.error('erro while logging Admin:');
    console.error(err.message || err);
    next(err);
  }
};

export const logout = (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
