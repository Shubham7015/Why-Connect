import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import { useSocket } from "@/hooks/use-socket";

const AsideBar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { onlineUsers } = useSocket();

  const isOnline = user?._id ? onlineUsers.includes(user._id) : false;

  return (
    <aside className="top-0 fixed inset-y-0 w-12 left-0 z-50 h-svh bg-primary/95 shadow-lg border-r border-white/10">
      <div className="h-full w-full px-1 pt-1 pb-6 flex flex-col items-center justify-between">
        <Logo
          url={PROTECTED_ROUTES.CHAT}
          imgClass="size-7"
          textClass="text-white"
          showText={false}
        />

        <div className="flex flex-col items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="border-0 rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className=" absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div role="button">
                {/* {Avatar} */}
                <AvatarWithBadge
                  name={user?.name || "unknown"}
                  src={user?.avatar || ""}
                  isOnline={isOnline}
                  className="bg-white!"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 rounded-lg z-9999" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
};

export default AsideBar;
