import { Search, Sun, Moon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { NewChatPopover } from "./newChat-popover";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "../theme-provider";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "../ui/button";
import AvatarWithBadge from "../avatar-with-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const ChatListHeader = ({ onSearch }: { onSearch: (val: string) => void }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { onlineUsers } = useSocket();

  const isOnline = user?._id ? onlineUsers.includes(user._id) : false;

  return (
    <div className="px-3 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        {/* Mobile-only: user avatar with logout */}
        <div className="flex items-center gap-2 lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div role="button">
                <AvatarWithBadge
                  name={user?.name || "unknown"}
                  src={user?.avatar || ""}
                  isOnline={isOnline}
                  className="size-8"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-40 rounded-lg z-9999"
              align="start"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        </div>

        {/* Desktop: just the title */}
        <h1 className="text-xl font-semibold hidden lg:block">Chats</h1>

        {/* Mobile: title in center */}
        <h1 className="text-xl font-semibold lg:hidden">Chats</h1>

        <div>
          <NewChatPopover />
        </div>
      </div>

      <div>
        <InputGroup className="bg-background text-sm">
          <InputGroupInput
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};

export default ChatListHeader;
