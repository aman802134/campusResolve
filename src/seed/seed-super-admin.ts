import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { USER_ROLES, USER_STATUS } from '../types/enums';
import { config } from '../config/config';

async function seedSuperAdmin() {
  try {
    await mongoose.connect(config.mongoUri);
    const existing = await UserModel.findOne({ role: USER_ROLES.SUPER_ADMIN });

    if (existing) {
      console.log('Super Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    await UserModel.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: USER_ROLES.SUPER_ADMIN,
      campus: undefined,
      verified: true,
      isBanned: false,
      status: USER_STATUS.ACTIVE,
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
