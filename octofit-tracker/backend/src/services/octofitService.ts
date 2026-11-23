import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.isObjectIdOrHexString(value);
}

function isObjectIdList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isObjectId);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) {
    throw badRequest('Activity must be an object');
  }

  const { userId, teamId, type, minutes } = input;
  if (!isObjectId(userId)) {
    throw badRequest('A valid userId is required');
  }
  if (!isObjectId(teamId)) {
    throw badRequest('A valid teamId is required');
  }
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw badRequest('Activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw badRequest('Activity minutes must be a positive number');
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw badRequest('Activity user and team must exist');
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) {
    throw badRequest('Team must be an object');
  }

  const { name, mascot, members } = input;
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw badRequest('Team name is required');
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw badRequest('Team mascot is required');
  }
  if (members !== undefined && !isObjectIdList(members)) {
    throw badRequest('Team members must be valid user IDs');
  }

  const memberIds = members === undefined ? [] : [...new Set(members)];
  if (memberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
    if (memberCount !== memberIds.length) {
      throw badRequest('All team members must exist');
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    {
      $lookup: {
        from: Team.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1 } },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);
  return totals.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.trim().toLowerCase();
  const activityTypes = new Set(activities.map(({ type }) => type.trim().toLowerCase()));

  return workouts
    .filter(({ focus }) => {
      const normalizedFocus = focus.trim().toLowerCase();
      return normalizedFocus === goal || activityTypes.has(normalizedFocus);
    })
    .map((workout) => {
      const matchesGoal = workout.focus.trim().toLowerCase() === goal;
      const recentActivity = activities[0];
      const reason = matchesGoal
        ? `Matches your ${user.fitnessGoal} fitness goal${recentActivity ? ` and recent ${recentActivity.type} activity` : ''}.`
        : `Matches your recent ${workout.focus} activity pattern.`;
      return { ...workout, reason };
    });
}

export { User };
