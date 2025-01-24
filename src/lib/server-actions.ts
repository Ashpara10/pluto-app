"use server";

import { eq } from "drizzle-orm";
import { hashPassword } from "./actions";
import { db } from "./db/drizzle";
import { NewUser, users } from "./db/schema";
import { RegisterUserPayload } from "./types";
import { getAvatarByUserInitials } from "./utils";

// User
export const register = async (payload: RegisterUserPayload) => {
  const { email, image, name, password } = payload;
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  // console.log({ existingUser });
  if (existingUser.length > 0) {
    return {
      data: null,
      error: `User with email ${existingUser[0]?.email} already exists`,
    };
  }
  const passwordHash = await hashPassword(password);
  const newUser: NewUser = {
    image: image || getAvatarByUserInitials(name) || null,
    name,
    email,
    passwordHash,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();
  if (!createdUser) {
    return { data: null, error: "Failed to create user. Please try again." };
  }
  return { data: createdUser, error: null };
};

// Workspace
