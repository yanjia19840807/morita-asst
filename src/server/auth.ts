import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type ListUsersOptions = NonNullable<Parameters<typeof auth.api.listUsers>[0]>;
type FetchUsersQuery = ListUsersOptions["query"];
type FetchUsersResult = Awaited<ReturnType<typeof auth.api.listUsers>>;

export async function fetchUsers(
  query: FetchUsersQuery = {},
): Promise<FetchUsersResult> {
  const data = await auth.api.listUsers({
    query,
    headers: await headers(),
  });

  return data;
}
