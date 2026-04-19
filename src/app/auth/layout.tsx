import React from "react";
import MainFooter from "@/components/copyright";
import AuthHeader from "@/components/auth-header";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <AuthHeader />
      <main className="flex justify-center items-center flex-1">
        {children}
      </main>
      <MainFooter />
    </div>
  );
}
