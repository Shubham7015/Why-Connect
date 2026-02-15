import { Outlet } from "react-router-dom";
import AppWrapper from "@/components/app-wrapper";

const AppLayout = () => {
  return (
    <AppWrapper>
      <div className="h-full">
        <Outlet />
      </div>
    </AppWrapper>
  );
};

export default AppLayout;
