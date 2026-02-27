import React from "react";
import AsideBar from "./aside-bar";

interface Props {
  children: React.ReactNode;
}

const AppWrapper = ({ children }: Props) => {
  return (
    <div className="h-full">
      {/* implement the toolBar */}
      <AsideBar />
      <main className="h-full lg:pl-12">{children}</main>
    </div>
  );
};

export default AppWrapper;
