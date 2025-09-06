import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { GENDER, USER_ROLES } from '../types/enums';
import { config } from '../config/config';
import { SuperAdminModel } from '../models/super-admin.model';
import { ApiError } from '../utils/api-error';

async function seedSuperAdmin() {
  try {
    await mongoose.connect(config.mongoUri);
    const existing = await SuperAdminModel.findOne({ role: USER_ROLES.SUPER_ADMIN });
    if (existing) {
      console.log('Super Admin already exists');
      throw new ApiError(400, 'super admin already exists');
    }

    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await SuperAdminModel.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: USER_ROLES.SUPER_ADMIN,
      gender: 'male',
    });

    console.log('✅ Super Admin seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding Super Admin:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seedSuperAdmin();
