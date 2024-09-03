import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const AddTask = mutation({
  args: {
    title: v.string(),
    clerkID: v.string(),
    deadline: v.string(),
    status: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("Task", {
      title: args.title,
      clerkID: args.clerkID,
      deadline: args.deadline,
      status: args.status,
    });
  },
});

export const Task = query({
  args: { clerkID: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("Task")
      .filter((q) => q.eq(q.field("clerkID"), args.clerkID))
      .collect();
  },
});

export const updateTaskInfo = mutation({
  args: {
    taskID: v.id("Task"),
    title: v.string(),
    deadline: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.taskID, {
      title: args.title,
      deadline: args.deadline,
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskID: v.id("Task"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.taskID);
  },
});

export const updateStatus = mutation({
  args: {
    taskID: v.id("Task"),
    status: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.taskID, {
      status: args.status,
    });
  },
});


