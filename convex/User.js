import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const currentUser = query(async (ctx) => {
  const user = await ctx.auth.getUserIdentity();
  return user;
});

export const createUser = mutation({
  args: {
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    clerkID: v.string(),
  },
  handler: async (ctx, args) => {
    const hero = await ctx.db.insert("Heroes", {
      firstname: args.firstname,
      lastname: args.lastname,
      email: args.email,
      clerkID: args.clerkID,
    });

    return hero;
  },
});

export const updateUser = mutation({
  args: {
    firstname: v.string(),
    lastname: v.optional(v.string()),
    email: v.string(),
    clerkID: v.string(),
  },
  handler: async (ctx, args) => {
    const heroes = await ctx.db
      .query("Heroes")
      .filter((q) => q.eq(q.field("clerkID"), args.clerkID))
      .collect();

    const hero = await ctx.db.patch(heroes[0]._id, {
      firstname: args.firstname,
      lastname: args.lastname,
      email: args.email,
    });
    return hero;
  },
});

export const deleteUser = mutation({
  args: {
    clerkID: v.string(),
  },
  handler: async (ctx, args) => {
    const heroes = await ctx.db
      .query("Heroes")
      .filter((q) => q.eq(q.field("clerkID"), args.clerkID))
      .collect();
    const tasks = await ctx.db
      .query("Task")
      .filter((q) => q.eq(q.field("clerkID"), args.clerkID))
      .collect();

    async function deleteTask() {
      try {
        tasks.map(async (task) => {
          await ctx.db.delete(task._id);
        });
        return true;
      } catch (error) {
        return false;
      }
    }
    async function deleteUser() {
      try {
        await ctx.db.delete(heroes[0]._id);
        return true;
      } catch (error) {
        return false;
      }
    }
    return await Promise.all([deleteTask(), deleteUser()]);
  },
});
