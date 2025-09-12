// src/aggregations/department.ts
import mongoose, { PipelineStage } from 'mongoose';

/**
 * Departments with user counts.
 */
export function departmentWithUserCountsPipeline(campusId: string): PipelineStage[] {
  return [
    { $match: { campus: new mongoose.Types.ObjectId(campusId) } },
    {
      $lookup: {
        from: 'users',
        let: { deptId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$department', '$$deptId'] } } },
          { $count: 'count' },
        ],
        as: 'userCountArr',
      },
    },
    {
      $addFields: {
        userCount: {
          $ifNull: [{ $arrayElemAt: ['$userCountArr.count', 0] }, 0],
        },
      },
    },
    { $project: { userCountArr: 0, name: 1, code: 1, userCount: 1 } },
  ];
}
