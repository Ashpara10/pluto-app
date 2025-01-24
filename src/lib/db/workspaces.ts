"use server";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "../auth";
import { CreateWorkspacePayload } from "../types";
import { getSlug } from "../utils";
import { db } from "./drizzle";
import { usersToWorkspaces, workspaces } from "./schema";

export const getUserWorkspaces = async () => {
  const session = await getServerAuthSession();
  if (!session) {
    throw new Error("USER-WORKSPACES: User not found");
  }
  const userWorkspaces = await db
    .select({ workspace: workspaces })
    .from(workspaces)
    .innerJoin(
      usersToWorkspaces,
      eq(workspaces.slug, usersToWorkspaces.workspaceSlug)
    )
    .where(eq(usersToWorkspaces.userId, session.user.id as string));

  return userWorkspaces;
};

export const getWorkspaceBySlug = async (slug: string) => {
  try {
    if (!slug) {
      throw new Error("Provide a valid workspace slug");
    }
    const w = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces?.slug, slug))
      .limit(1);

    return { data: w[0], error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const createWorkspace = async (payload: CreateWorkspacePayload) => {
  try {
    const session = await getServerAuthSession();
    const slug = getSlug(payload?.name);
    const workspace = await db
      .insert(workspaces)
      .values({
        name: payload?.name,
        image: payload?.image,
        slug: slug,
      })
      .returning();

    await db.insert(usersToWorkspaces).values({
      workspaceSlug: slug,
      userId: session?.user?.id as string,
    });
    return { data: workspace[0], error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const deleteWorkspace = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Provide a valid workspace ID");
    }
    await db.delete(workspaces).where(eq(workspaces?.id, id));
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};
