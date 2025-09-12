// src/aggregations/user.ts
import mongoose, { PipelineStage } from 'mongoose';

/**
 * Get users by campus with department info.
 */
export function usersByCampusPipeline(campusId: string): PipelineStage[] {
  return [
    { $match: { campus: new mongoose.Types.ObjectId(campusId) } },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'department',
        pipeline: [{ $project: { name: 1, code: 1 } }],
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
  ];
}
