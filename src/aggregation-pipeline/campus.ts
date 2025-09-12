// src/aggregations/campus.ts
import mongoose, { PipelineStage } from 'mongoose';

/**
 * Campus list with admin projection, department count, and user count.
 * Good for dashboard table.
 */
export function campusWithCountsPipeline(): PipelineStage[] {
  return [
    {
      $project: {
        name: 1,
        address: 1,
        city: 1,
        state: 1,
        pinCode: 1,
        campusCode: 1,
        admins: 1,
        createdAt: 1,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'admins',
        foreignField: '_id',
        as: 'admins',
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'departments',
        let: { campusId: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$campus', '$$campusId'] } } }, { $count: 'count' }],
        as: 'departmentCountArr',
      },
    },
    {
      $addFields: {
        departmentCount: {
          $ifNull: [{ $arrayElemAt: ['$departmentCountArr.count', 0] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { campusId: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$campus', '$$campusId'] } } }, { $count: 'count' }],
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
    { $project: { departmentCountArr: 0, userCountArr: 0 } },
  ];
}

/**
 * Campus detail with department list + counts inside each department.
 */
export function campusDetailPipeline(campusId: string): PipelineStage[] {
  return [
    { $match: { _id: new mongoose.Types.ObjectId(campusId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'admins',
        foreignField: '_id',
        as: 'admins',
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'departments',
        let: { campusId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$campus', '$$campusId'] } } },
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
        ],
        as: 'departments',
      },
    },
  ];
}
