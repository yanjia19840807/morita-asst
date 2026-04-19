"use client";

import React from "react";
import Link from "next/link";
import Logo from "./logo";
import { buttonVariants } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import UserAvatar from "./user-avatar";
import AuthBar from "./auth-bar";

export default function NavBar() {
  return (
    <nav className="flex w-full justify-between py-2">
      <div className="flex items-center gap-4">
        <Logo />

        <div className="flex items-center gap-2">
          <Link className={buttonVariants({ variant: "ghost" })} href="/">
            主页
          </Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/">
            知识库
          </Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/">
            文档
          </Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/users">
            用户
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AuthBar />
        <UserAvatar />
        <ModeToggle />
      </div>
    </nav>
  );
}
