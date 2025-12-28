import { useSearchDialog, useSidebarOpenContext } from "@/lib/context";
import { ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const GlobalKeybindProvider = ({ children }: { children: ReactNode }) => {
  const { isSearchDialogOpen, setIsSearchDialogOpen } = useSearchDialog();
  useHotkeys("ctrl+b", () => {
    setIsSearchDialogOpen!(!isSearchDialogOpen);
  });
  return children;
};

export default GlobalKeybindProvider;
