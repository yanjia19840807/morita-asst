"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default function ProfileView() {
  const { data, isPending } = authClient.useSession();

  if (isPending || !data) {
    return null;
  }

  const user = data.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的资料</CardTitle>
        <CardDescription>{user.email}</CardDescription>
        <CardAction>
          <Link
            className={buttonVariants({ variant: "default" })}
            href="/profile/edit"
          >
            <Pencil />
            编辑
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet>
            <Field orientation="horizontal">
              <FieldLabel>头像</FieldLabel>
              <Avatar size="lg">
                <AvatarImage src={user.image || "/avatar-default.svg"} />
                <AvatarFallback>
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldLabel>名称</FieldLabel>
              <FieldDescription>{user.name}</FieldDescription>
            </Field>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
