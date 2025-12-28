"use client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { cache, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { Workspace } from "../db/schema";
import { getUserWorkspaces, getWorkspaceBySlug } from "../db/workspaces";

const cachedGetUserWorkspaces = cache(async () => getUserWorkspaces());
export const useWorkspaces = () => {
  const { data: user, update } = useSession();
  const router = useRouter();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const { workspace: workspaceId } = useParams();
  const { data, isLoading, refetch } = useQuery(
    ["get-workspaces"],
    async () => await cachedGetUserWorkspaces(),
    { enabled: false }
  );

  useEffect(() => {
    refetch();
  }, [user, refetch]);

  useEffect(() => {
    if (!workspaceId) {
      router.push("/workspace");
      return;
    }
    (async () => {
      const workspace = await getWorkspaceBySlug(workspaceId as string);
      // console.log({ workspace, workspaceId });
      if (workspace?.error) {
        toast.error(workspace?.error);
        return;
      }
      if (!workspace.data) {
        router.push("/workspace");
        return;
      }
      const w = {
        id: workspace?.data?.id,
        name: workspace?.data?.name as string,
        slug: workspace?.data?.slug as string,
      };
      update({ ...user, user: { ...user?.user, activeWorkspace: w } });
      setCurrentWorkspace(workspace?.data);
    })();
  }, [workspaceId, router]);

  return {
    isLoading,
    workspaces: data,
    currentWorkspace,
  };
};
