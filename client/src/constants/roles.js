export const ROLES = Object.freeze({ OWNER: "owner", CUSTOMER: "customer", ADMIN: "admin" });

export const dashboardPathForRole = (role) => ({
  [ROLES.OWNER]: "/owner/dashboard",
  [ROLES.CUSTOMER]: "/customer/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
}[role] || "/login");
