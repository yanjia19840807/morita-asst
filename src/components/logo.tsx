import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <div className="flex items-center gap-8">
      <Link href="/">
        <h1 className="text-2xl font-bold">
          云天<span>助手</span>
        </h1>
      </Link>
    </div>
  );
}

export default Logo;
