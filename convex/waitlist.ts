import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Constants
const AVG_MINS_PER_REQUEST = 60 * 24 * 7; // 1 week per request (10080 minutes)
const DEFAULT_WEEKLY_CAP = 10;

// Helper function to get current week key
function getCurrentWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const week = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

// Helper function to format ETA
function formatETA(position: number): string {
  const mins = position * AVG_MINS_PER_REQUEST;
  const target = new Date(Date.now() + mins * 60 * 1000);
  const sameYear = target.getFullYear() === new Date().getFullYear();
  const opts: Intl.DateTimeFormatOptions = sameYear 
    ? { month: 'short', day: 'numeric' } 
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return 'by ' + target.toLocaleDateString(undefined, opts);
}

// Submit waitlist entry
export const submitWaitlist = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    appIdea: v.string(),
    platform: v.string(),
    documents: v.optional(v.array(v.string())), // selected docs
  },
  handler: async (ctx, args) => {
    const weekKey = getCurrentWeekKey();
    const submittedAt = Date.now();
    
    // Get or create weekly stats
    let weeklyStats = await ctx.db
      .query("weeklyStats")
      .withIndex("by_week", (q) => q.eq("weekKey", weekKey))
      .first();
    
    if (!weeklyStats) {
      const statsId = await ctx.db.insert("weeklyStats", {
        weekKey,
        cap: DEFAULT_WEEKLY_CAP,
        count: 0,
        totalSubmissions: 0,
        lastUpdated: submittedAt,
      });
      weeklyStats = await ctx.db.get(statsId);
    }

    if (!weeklyStats) {
      throw new Error("Failed to initialize weekly stats");
    }
    
    // Check if weekly cap is reached
    if (weeklyStats.count >= weeklyStats.cap) {
      return {
        accepted: false,
        reason: 'weekly_cap_reached',
        weeklyCap: weeklyStats.cap,
        weekKey,
        currentWeekCount: weeklyStats.count,
        remainingThisWeek: 0,
        total: weeklyStats.totalSubmissions,
      };
    }
    
    // Check if email already exists
    const existingSubmission = await ctx.db
      .query("waitlistSubmissions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingSubmission) {
      return {
        accepted: false,
        reason: 'email_already_submitted',
        existingSubmission,
      };
    }
    
    // Create new submission
    const position = weeklyStats.count + 1;
    const submissionId = await ctx.db.insert("waitlistSubmissions", {
      ...args,
      submittedAt,
      status: "pending",
      weeklyCap: weeklyStats.cap,
      weekKey,
      position,
    });
    
    // Update weekly stats
    await ctx.db.patch(weeklyStats._id, {
      count: weeklyStats.count + 1,
      totalSubmissions: weeklyStats.totalSubmissions + 1,
      lastUpdated: submittedAt,
    });
    
    // Trigger email action
    await ctx.scheduler.runAfter(0, api.emails.sendConfirmationEmail, {
      submissionId,
      email: args.email,
      name: args.name,
      position,
      eta: formatETA(position),
    });
    
    // Also notify the owner with full submission details
    await ctx.scheduler.runAfter(0, api.emails.sendOwnerNotificationEmail, {
      name: args.name,
      email: args.email,
      appIdea: args.appIdea,
    });
    
    return {
      accepted: true,
      submissionId,
      position,
      weeklyCap: weeklyStats.cap,
      weekKey,
      remainingThisWeek: weeklyStats.cap - (weeklyStats.count + 1),
      total: weeklyStats.totalSubmissions + 1,
    };
  },
});

// Get waitlist status
export const getWaitlistStatus = query({
  handler: async (ctx) => {
    const weekKey = getCurrentWeekKey();
    
    const weeklyStats = await ctx.db
      .query("weeklyStats")
      .withIndex("by_week", (q) => q.eq("weekKey", weekKey))
      .first();
    
    if (!weeklyStats) {
      return {
        total: 0,
        weeklyCap: DEFAULT_WEEKLY_CAP,
        weekKey,
        currentWeekCount: 0,
        remainingThisWeek: DEFAULT_WEEKLY_CAP,
      };
    }
    
    return {
      total: weeklyStats.totalSubmissions,
      weeklyCap: weeklyStats.cap,
      weekKey,
      currentWeekCount: weeklyStats.count,
      remainingThisWeek: Math.max(0, weeklyStats.cap - weeklyStats.count),
    };
  },
});

// Get submission by email
export const getSubmissionByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("waitlistSubmissions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update submission status
export const updateSubmissionStatus = mutation({
  args: {
    submissionId: v.id("waitlistSubmissions"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      status: args.status,
    });
    
    if (args.status === "completed") {
      const submission = await ctx.db.get(args.submissionId);
      if (submission) {
        await ctx.scheduler.runAfter(0, api.emails.sendCompletionEmail, {
          email: submission.email,
          name: submission.name,
        });
      }
    }
  },
});