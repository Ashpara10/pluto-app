import { ResizablePanel } from "../ui/resizable";
import ChatAssistant from "./chat-assistant";

const ChatWithDocumentSidebar = () => {
  return (
    <ResizablePanel
      id="chat-with-document-sidebar"
      className="relative hidden z-20 h-screen md:flex "
      maxSize={30}
    >
      <ChatAssistant />
    </ResizablePanel>
  );
};

export default ChatWithDocumentSidebar;
