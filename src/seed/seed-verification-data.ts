// seed/data/verificationData.ts
import mongoose from 'mongoose';
import { USER_ROLES } from '../types/enums';
import { config } from '../config/config';
import { VerificationModel } from '../models/verification.model';

const verificationSeedData = [
  {
    externalId: 'QVC-STU001',
    name: 'Alice Quantum',
    email: 'alice.qvc@example.com',
    role: USER_ROLES.STUDENT,
    campus: '688fd5abf2bb1f470d43a684',
    department: '688fd63cf2bb1f470d43a694',
  },
  {
    externalId: 'QVC-FAC001',
    name: 'Dr. Bob Quantum',
    email: 'bob.qvc@example.com',
    role: USER_ROLES.FACULTY_ACADEMIC,
    campus: '688fd5abf2bb1f470d43a684',
    department: '688fd675f2bb1f470d43a69a',
  },
  {
    externalId: 'QVC-DPT001',
    name: 'Charlie Quantum',
    email: 'charlie.qvc@example.com',
    role: USER_ROLES.DEPARTMENT_HEAD,
    campus: '688fd5abf2bb1f470d43a684',
    department: '688fd6c2f2bb1f470d43a6a0',
  },
  {
    externalId: 'QVC-CMP001',
    name: 'Dana Quantum',
    email: 'dana.qvc@example.com',
    role: USER_ROLES.CAMPUS_HEAD,
    campus: '688fd5abf2bb1f470d43a684', // No department needed
  },
  {
    externalId: 'PGU-STU001',
    name: 'Alice Pixel',
    email: 'alice.pgu@example.com',
    role: 'student',
    campus: '688fd5cff2bb1f470d43a687',
    department: '688fdb648b53e4f112bccaab',
  },
  {
    externalId: 'PGU-FAC001',
    name: 'Bob Pixel',
    email: 'bob.pgu@example.com',
    role: 'faculty_academic',
    campus: '688fd5cff2bb1f470d43a687',
    department: '688fdb788b53e4f112bccab4',
  },
  {
    externalId: 'PGU-DPT001',
    name: 'Charlie Pixel',
    email: 'charlie.pgu@example.com',
    role: 'department_admin',
    campus: '688fd5cff2bb1f470d43a687',
    department: '688fdba08b53e4f112bccabe',
  },
  {
    externalId: 'PGU-CMP001',
    name: 'Eve Pixel',
    email: 'eve.pgu@example.com',
    role: 'campus_admin',
    campus: '688fd5cff2bb1f470d43a687',
  },
];

async function seedVerifications() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('🔌 Connected to MongoDB');

    for (const entry of verificationSeedData) {
      const exists = await VerificationModel.findOne({ externalId: entry.externalId });
      if (exists) {
        console.log(`⚠️ Already exists: ${entry.externalId}`);
        continue;
      }

      await VerificationModel.create({
        externalId: entry.externalId,
        name: entry.name,
        email: entry.email,
        role: entry.role,
        campus: entry.campus,
        ...(entry.department && { department: entry.department }),
      });

      console.log(`✅ Seeded: ${entry.externalId}`);
    }

    console.log('🎉 Verification data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding verification data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seedVerifications();
