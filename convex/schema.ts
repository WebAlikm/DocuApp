import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlistSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    appIdea: v.string(),
    platform: v.string(),
    documents: v.optional(v.array(v.string())), // selected docs
    submittedAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed")),
    weeklyCap: v.number(),
    weekKey: v.string(),
    position: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_week", ["weekKey"])
    .index("by_status", ["status"]),

  weeklyStats: defineTable({
    weekKey: v.string(),
    cap: v.number(),
    count: v.number(),
    totalSubmissions: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_week", ["weekKey"]),
});