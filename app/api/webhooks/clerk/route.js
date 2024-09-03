import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Result } from "postcss";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export async function POST(req) {

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("ERROR IN IF");
    return new NextResponse(
      { message: "Missing required headers" },
      { status: 400 }
    );
  }
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse({ status: 400 });
  }

  const user = evt.data;
  const eventType = evt.type;
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  switch (eventType) {
    case "user.created":
      let data1 = {
        firstname: user.first_name || "",
        lastname: user.last_name || "",
        email: user.email_addresses[0]?.email_address,
        clerkID: user.id,
      };
      await convex.mutation(api.User.createUser, data1);
      break;
    case "user.updated":
      let data = {
        firstname: user.first_name || "",
        lastname: user.last_name || "",
        email: user.email_addresses[0]?.email_address,
        clerkID: user.id,
      };
      await convex.mutation(api.User.updateUser, data);
      break;
    case "user.deleted":
      await convex.mutation(api.User.deleteUser, {
        clerkID: user.id,
      });

      break;
  }
  return new Response("", { status: 200 });
}
export async function GET() {
  return NextResponse.json({ hello: "WORLD" });
}
