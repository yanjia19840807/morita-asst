import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "./ui/button";

export default function AuthBar() {
  const { data, isPending } = authClient.useSession();

  if (data && data.session) {
    return null;
  }

  return (
    <>
      <Link className={buttonVariants()} href="/auth/sign-up">
        注册
      </Link>
      <Link
        className={buttonVariants({ variant: "outline" })}
        href="/auth/sign-in"
      >
        登录
      </Link>
    </>
  );
}
