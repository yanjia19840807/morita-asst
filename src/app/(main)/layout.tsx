import React from "react";
import NavBar from "@/components/nav-bar";
import PageHeader from "@/components/page-header";
import Copyright from "@/components/copyright";

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col flex-1">
      <NavBar />
      <PageHeader />
      <main className="flex-1">{children}</main>
      <Copyright />
    </div>
  );
}

export default MainLayout;
