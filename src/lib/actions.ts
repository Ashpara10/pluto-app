"use server";
import {
  Collection,
  Document,
  NewUser,
  users,
  Workspace,
} from "@/lib/db/schema";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { instance } from "./axios";
import { getCollectionBySlug } from "./db/collections";
import { db } from "./db/drizzle";
import { RegisterSchema, SortDocumentBy, TGetDocument } from "./types";
import { getAvatarByUserInitials } from "./utils";

const key = new TextEncoder().encode("532d15e19a1c159dda7474c6c773ff87");
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export async function signToken(payload: Workspace) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
  return token;
}

export async function verifyJWTPayload(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export const register = async (payload: z.infer<typeof RegisterSchema>) => {
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

// Collection actions
export const getAllCollections = async (workspace: string) => {
  const res = await instance.get(`/collection`, {
    params: {
      workspace: workspace,
    },
  });
  // console.log(res?.data);
  if (!res.data) {
    return { data: null, error: "Failed to fetch collections" };
  }
  return { data: res.data.data, error: null } as {
    data: { collection: Collection; documents_count: string }[];
    error: null;
  };
};

type GetCollectionDocumentsResponse = {
  collection: Collection;
  documents: Document[];
}[];

export const getCollectionDocuments = async ({
  slug,
  sortBy,
  workspace,
}: {
  slug: string;
  workspace: string;
  sortBy: SortDocumentBy;
}) => {
  const { data: collection, error } = await getCollectionBySlug(slug);
  if (error) {
    return { data: null, error: error };
  }
  const { data, status } = await instance.get(`/collection/${slug}`, {
    params: {
      workspace: workspace,
      sortBy: sortBy,
    },
  });
  if (status !== 201) {
    return { data: null, error: "Failed to fetch documents" };
  }

  return {
    data: { documents: data?.data as TGetDocument[], collection: collection },
    error: null,
  };
};

// Document actions
export const fetchDocuments = async (
  workspace: string,
  sortBy: SortDocumentBy
) => {
  const res = await instance.get("/document", {
    params: {
      workspace: workspace,
      sortBy: sortBy,
    },
    fetchOptions: {
      cache: "force-cache",
    },
  });
  if (!res?.data) {
    return { data: null, error: "Failed to fetch documents" };
  }

  return { data: res.data?.documents as TGetDocument[], error: null };
};
