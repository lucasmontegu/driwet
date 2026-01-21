import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// B2B organization plans
export const orgPlanEnum = pgEnum("org_plan", [
  "starter",
  "pro",
  "business",
  "enterprise",
]);

// Organization member roles
export const orgRoleEnum = pgEnum("org_role", ["owner", "admin", "viewer"]);

// Vehicle status
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "active",
  "inactive",
]);

// Organizations table (B2B customers)
export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  plan: orgPlanEnum("plan").default("starter").notNull(),
  billingEmail: text("billing_email"),
  maxVehicles: integer("max_vehicles").default(25).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Organization members (users belonging to an org)
export const orgMember = pgTable(
  "org_member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: orgRoleEnum("role").default("viewer").notNull(),
    invitedAt: timestamp("invited_at").defaultNow().notNull(),
    joinedAt: timestamp("joined_at"),
  },
  (table) => [
    index("org_member_org_idx").on(table.organizationId),
    index("org_member_user_idx").on(table.userId),
  ],
);

// Vehicles in a fleet
export const vehicle = pgTable(
  "vehicle",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    plate: text("plate").notNull(),
    label: text("label"), // Optional friendly name (e.g., "Moto 15")
    assignedUserId: text("assigned_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    status: vehicleStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("vehicle_org_idx").on(table.organizationId),
    index("vehicle_assigned_user_idx").on(table.assignedUserId),
  ],
);

// Fleet alert history (for B2B reporting)
export const fleetAlertHistory = pgTable(
  "fleet_alert_history",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    alertType: text("alert_type").notNull(),
    severity: text("severity").notNull(), // low, medium, high, extreme
    vehiclesAffected: integer("vehicles_affected").default(0).notNull(),
    managedAt: timestamp("managed_at"),
    managedBy: text("managed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("fleet_alert_org_idx").on(table.organizationId),
    index("fleet_alert_created_idx").on(table.createdAt),
  ],
);

// Relations
export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(orgMember),
  vehicles: many(vehicle),
  alertHistory: many(fleetAlertHistory),
}));

export const orgMemberRelations = relations(orgMember, ({ one }) => ({
  organization: one(organization, {
    fields: [orgMember.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [orgMember.userId],
    references: [user.id],
  }),
}));

export const vehicleRelations = relations(vehicle, ({ one }) => ({
  organization: one(organization, {
    fields: [vehicle.organizationId],
    references: [organization.id],
  }),
  assignedUser: one(user, {
    fields: [vehicle.assignedUserId],
    references: [user.id],
  }),
}));

export const fleetAlertHistoryRelations = relations(
  fleetAlertHistory,
  ({ one }) => ({
    organization: one(organization, {
      fields: [fleetAlertHistory.organizationId],
      references: [organization.id],
    }),
    managedByUser: one(user, {
      fields: [fleetAlertHistory.managedBy],
      references: [user.id],
    }),
  }),
);
