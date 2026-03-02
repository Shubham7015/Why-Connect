import { Outlet } from "react-router-dom";
import AppWrapper from "@/components/app-wrapper";
import ChatList from "@/components/chat/chat-list";
import { cn } from "@/lib/utils";
import useChatId from "@/hooks/use-chat-id";

const AppLayout = () => {
  const chatId = useChatId();
  return (
    <AppWrapper>
      <div className="h-full">
        {/* chatlist */}
        <div className={cn(chatId ? "hidden lg:block" : "block")}>
          <ChatList />
        </div>

        <div
          className={cn(
            "lg:pl-95! pl-0",
            !chatId ? "hidden lg:block" : "block",
          )}
        >
          <Outlet />
        </div>
      </div>
    </AppWrapper>
  );
};

export default AppLayout;
