import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "./logo";
import { buttonVariants } from "./ui/button";

function Navbar() {
  return (
    <nav className="flex w-full justify-between">
      <div className="flex items-center gap-8">
        <Logo />

        <div className="flex items-center gap-2">
          <Link href="/">主页</Link>
          <Link href="/">知识库</Link>
          <Link href="/">文档</Link>
          <Link href="/">用户</Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link className={buttonVariants()} href="/auth/sign-up">
          注册
        </Link>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/auth/sign-in"
        >
          登录
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
