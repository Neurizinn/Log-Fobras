import { useAuth } from "@/hooks/use-auth";

export function usePermission() {
  const { user } = useAuth();
  console.log("neuri: ",user)
  const permissions = user?.permissions || [];

  function hasPermission(perm: string) {
    return permissions.includes(perm);
  }

  function hasAnyPermission(perms: string[]) {
    return perms.some((p) => permissions.includes(p));
  }

  function hasAllPermissions(perms: string[]) {
    return perms.every((p) => permissions.includes(p));
  }

  return { hasPermission, hasAnyPermission, hasAllPermissions };
}
