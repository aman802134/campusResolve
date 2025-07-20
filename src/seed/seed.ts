// scripts/seedUsers.ts
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/config';
import { UserModel } from '../models/user.model';
import { USER_ROLES, GENDER, USER_STATUS } from '../types/enums';

const mongoUri = config.mongoUri;

interface SeedUser {
  name: string;
  email: string;
  plainPassword: string;
  role: USER_ROLES;
  campus: string;
  department?: string;
  phone?: string;
  gender?: GENDER;
}

const seedUsers = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const existingUsers = await UserModel.countDocuments();
    if (existingUsers > 1) {
      console.log('⚠️ Users already seeded. Aborting...');
      return process.exit(0);
    }

    const users: SeedUser[] = [
      {
        name: 'Student User',
        email: 'student@example.com',
        plainPassword: 'student123',
        role: USER_ROLES.STUDENT,
        campus: 'Main Campus',
        department: 'CSE',
        phone: '1111111111',
        gender: GENDER.MALE,
      },
      {
        name: 'Academic Faculty',
        email: 'faculty.academic@example.com',
        plainPassword: 'facacad123',
        role: USER_ROLES.FACULTY_ACADEMIC,
        campus: 'Main Campus',
        department: 'CSE',
        phone: '2222222222',
        gender: GENDER.FEMALE,
      },
      {
        name: 'Non‑Acad Faculty',
        email: 'faculty.nonacad@example.com',
        plainPassword: 'facnonacad123',
        role: USER_ROLES.FACULTY_NON_ACADEMIC,
        campus: 'Main Campus',
        department: 'CSE',
        phone: '3333333333',
        gender: GENDER.OTHER,
      },
      {
        name: 'Department Admin',
        email: 'deptadmin@example.com',
        plainPassword: 'deptadmin123',
        role: USER_ROLES.DEPARTMENT_ADMIN,
        campus: 'Main Campus',
        department: 'CSE',
        phone: '4444444444',
        gender: GENDER.MALE,
      },
      {
        name: 'Campus Admin',
        email: 'campusadmin@example.com',
        plainPassword: 'campusadmin123',
        role: USER_ROLES.CAMPUS_ADMIN,
        campus: 'Main Campus',
        phone: '5555555555',
        gender: GENDER.FEMALE,
      },
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        plainPassword: 'superadmin123',
        role: USER_ROLES.SUPER_ADMIN,
        campus: 'Main Campus',
        phone: '6666666666',
        gender: GENDER.OTHER,
      },
    ];

    // Hash each password and build the final user docs
    const docs = await Promise.all(
      users.map(async (u) => ({
        name: u.name,
        email: u.email,
        password: await bcrypt.hash(u.plainPassword, 10),
        role: u.role,
        campus: u.campus,
        department: u.department,
        phone: u.phone,
        gender: u.gender,
        status: USER_STATUS.ACTIVE,
        verified: true,
        isBanned: false,
      })),
    );

    await UserModel.insertMany(docs);
    console.log('✅ Seeded users successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
