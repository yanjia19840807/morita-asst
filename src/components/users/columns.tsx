"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { fetchUsers } from "@/server/auth";

type UserRow = Awaited<ReturnType<typeof fetchUsers>>["users"][number];

export const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "email",
    header: "邮箱地址",
  },
  {
    accessorKey: "emailVerified",
    header: "是否验证",
    cell: ({ row }) => (row.original.emailVerified ? "是" : "否"),
  },
  {
    accessorKey: "image",
    header: "头像",
    cell: ({ row }) => row.original.image ?? "-",
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "role",
    header: "角色",
    cell: ({ row }) => row.original.role ?? "-",
  },
  {
    accessorKey: "banned",
    header: "禁止",
    cell: ({ row }) => (row.original.banned ? "是" : "否"),
  },
  {
    accessorKey: "banReason",
    header: "禁止原因",
    cell: ({ row }) => row.original.banReason ?? "-",
  },
  {
    accessorKey: "banExpires",
    header: "禁止期限",
    cell: ({ row }) =>
      row.original.banExpires
        ? new Date(row.original.banExpires).toLocaleString()
        : "-",
  },
];
