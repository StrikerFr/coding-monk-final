export type AdminUserStatus = "Active" | "Inactive" | "Pending";
export type FacilityStatus = "Active" | "Attention";
export type ConfigurationStatus = "Complete" | "Incomplete";
export type PermissionLevel = "view" | "create" | "edit" | "admin";

export type AdminSession = { name: string; role: string; facility: string; status: "Active" };
export type AccessEntry = { label: string; assigned: boolean };
export type AdminUser = {
  id: string;
  name: string;
  role: string;
  facility: string;
  status: AdminUserStatus;
  lastActivity: string;
  initials: string;
  access: AccessEntry[];
};
export type PermissionRow = {
  category: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  admin: boolean;
};
export type AdminRole = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: PermissionRow[];
};
export type FacilitySettings = {
  defaultLanguage: "Hindi" | "English";
  secondaryLanguage: "Hindi" | "English";
  accessibilityDefaults: boolean;
  assistedKiosk: boolean;
  patientKiosk: boolean;
};
export type AdminFacility = {
  id: string;
  name: string;
  status: FacilityStatus;
  userCount: number;
  configurationStatus: ConfigurationStatus;
  lastUpdated: string;
  languages: string[];
  settings: FacilitySettings;
};
export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  status: "Completed" | "Viewed";
  correlationId: string;
};
export type AdminConfiguration = {
  defaultLanguage: "Hindi" | "English";
  secondaryLanguage: "Hindi" | "English";
  largeTextDefault: boolean;
  highContrastAvailable: boolean;
  reducedMotionAvailable: boolean;
  patientKiosk: boolean;
  assistedKiosk: boolean;
  notificationsConfigured: boolean;
};
export type AdminOverview = {
  users: number;
  roles: number;
  facilities: number;
  pendingActions: number;
  attention: { id: string; text: string; to: "/admin/users" | "/admin/facilities" }[];
};
