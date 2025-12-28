import { useRef } from "react";
import { ResizablePanel } from "../ui/resizable";
import ChatAssistant from "./chat-assistant";
import { ImperativePanelHandle } from "react-resizable-panels";

const ChatWithDocumentSidebar = () => {
  const ref = useRef<ImperativePanelHandle>(null);

  return (

    <ChatAssistant
      isCollapsed={Boolean(ref?.current?.isCollapsed())}
      handleCollapse={() => ref?.current?.collapse()}
    />

  );
};

export default ChatWithDocumentSidebar;
