import { AuthenticatedHandler, withAuth } from "./with-auth";
import { ForbiddenError, handleApiError } from "./errors";

// lib/api/with-role.ts
export function withRole(roles: string[], handler: AuthenticatedHandler) {
  return withAuth(async (request, context) => {
    if (!roles.includes(context.user.role || "")) {
      return handleApiError(new ForbiddenError());
    }

    return handler(request, context);
  });
}
