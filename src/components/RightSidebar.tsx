import React, { useRef } from 'react'
import { ResizablePanel } from './ui/resizable'
import { ImperativePanelHandle } from 'react-resizable-panels';
import ChatAssistant from './chat/chat-assistant';
import { useQueryState } from 'nuqs';
import { useQuery } from 'react-query';
import { getDocument } from '@/app/(dashboard)/w/[workspace]/document/[id]/actions';
import DocumentPage from './documents/DocumentPage';
import { Button } from './ui/button';
import { Loader, X } from 'lucide-react';



const RightSidebar = () => {
    const ref = useRef<ImperativePanelHandle>(null);
    const [documentId] = useQueryState("documentId")

    const { data: document, isLoading } = useQuery({
        enabled: !!documentId,
        queryKey: ["get-document", documentId],
        queryFn: async () => {
            return getDocument(documentId as string)
        }
    })

    return (
        <ResizablePanel
            id="chat-with-document-sidebar"
            className="relative overflow-hidden flex-col dark:bg-neutral-800 hidden z-20 h-screen md:flex "
            maxSize={documentId ? 60 : 40}
            collapsible
            ref={ref}
        >
            {/* {documentId && document?.data &&
            */}
            <div className="flex items-center justify-start py-2">
                <Button onClick={() => ref?.current?.collapse()} variant="ghost" size={"smallIcon"} className='rounded-full'>
                    <X className="size-4" />
                </Button>
            </div>

            {/* {!documentId ? <ChatAssistant
                isCollapsed={Boolean(ref?.current?.isCollapsed())}
                handleCollapse={() => ref?.current?.collapse()}
            /> : */}
            {(!document?.data ? <div>
                <Loader className='size-4 animate-spin' />
            </div> : <DocumentPage document={document?.data} />)}


            {/* {documentId ? isLoading && document?.data ? <DocumentDataSkeleton /> :<DocumentPage document={document?.data} /> : <ChatAssistant
                isCollapsed={Boolean(ref?.current?.isCollapsed())}
                handleCollapse={() => ref?.current?.collapse()}
            />} */}
        </ResizablePanel>
    )
}

export default RightSidebar