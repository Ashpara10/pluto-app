"use client";
import DialogProvider from "@/components/dialogs/dialog-provider";
import GlobalKeybindProvider from "@/components/editor/GlobalKeybindProvider";
import { nodes, theme } from "@/components/editor/theme";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import AppContextProvider from "./context";
import { ReactLenis } from "@studio-freight/react-lenis";
export const editorConfig: InitialConfigType = {
  namespace: "editor",
  theme: theme,
  onError: console.error,
  nodes: nodes,
};

const LexicalConfigContext = createContext<{
  config: InitialConfigType | null;
  setConfig: Dispatch<SetStateAction<InitialConfigType>>;
}>({
  config: null,
  setConfig: () => {},
});

export const useLexicalConfig = () => {
  const context = useContext(LexicalConfigContext);
  if (context === undefined) {
    throw new Error(
      "useLexicalConfig must be used within a LexicalConfigProvider"
    );
  }
  return context;
};

const Providers = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState(editorConfig);
  return (
    <AppContextProvider>
      <LexicalConfigContext.Provider value={{ config, setConfig: setConfig }}>
        <LexicalComposer initialConfig={{ ...editorConfig }}>
          <GlobalKeybindProvider>
            <DialogProvider>{children}</DialogProvider>
          </GlobalKeybindProvider>
        </LexicalComposer>
      </LexicalConfigContext.Provider>
    </AppContextProvider>
  );
};

export default Providers;
