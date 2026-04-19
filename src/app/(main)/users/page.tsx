import React, { Suspense } from "react";
import { columns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";
import { fetchUsers } from "@/server/auth";

export default async function UsersPage() {
  const data = await fetchUsers();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataTable columns={columns} data={data.users} />
    </Suspense>
  );
}
