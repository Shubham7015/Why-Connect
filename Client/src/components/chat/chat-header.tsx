import { getOtherUserAndGroup } from "@/lib/helper";
import { PROTECTED_ROUTES } from "@/routes/routes";
import type { ChatType } from "@/types/chat.type";
import { ArrowLeft, Phone, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AvatarWithBadge from "../avatar-with-badge";
import { usePeer } from "@/hooks/use-peer";
import { Button } from "../ui/button";

interface Props {
  chat: ChatType;
  currentUserId: string | null;
}
const ChatHeader = ({ chat, currentUserId }: Props) => {
  const navigate = useNavigate();
  const { name, subheading, avatar, isOnline, isGroup, otherUser, isAI } =
    getOtherUserAndGroup(chat, currentUserId);

  const { startCall } = usePeer();

  return (
    <div
      className="sticky top-0
    flex items-center justify-between border-b border-border
    bg-card px-2 z-50
    "
    >
      <div className="flex items-center gap-5 h-14 px-4 overflow-hidden">
        <ArrowLeft
          className="w-5 h-5 inline-block lg:hidden
          text-muted-foreground cursor-pointer
          mr-2
          "
          onClick={() => navigate(PROTECTED_ROUTES.CHAT)}
        />
        <AvatarWithBadge
          name={name}
          src={avatar}
          isGroup={isGroup}
          isOnline={isOnline}
        />
        <div className="ml-2 overflow-hidden">
          <h5 className="font-semibold truncate">{name}</h5>
          <p
            className={`text-xs truncate ${
              isOnline ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {subheading}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pr-4">
        {!isGroup && !isAI && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => otherUser && startCall(otherUser, "voice")}
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary rounded-full"
              onClick={() => otherUser && startCall(otherUser, "video")}
            >
              <Video className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
