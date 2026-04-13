import dayjs from "dayjs";
import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ── Auth tables (Better Auth) ──

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => dayjs().toDate()),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => dayjs().toDate()),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => dayjs().toDate()),
});

// ── Domain tables ──

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),

  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => dayjs().toDate()),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  lead_source: text("lead_source").notNull().default("manual"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  phone: text("phone"),
  whatsapp_number: text("whatsapp_number"),
  website_url: text("website_url"),
  google_rating: real("google_rating").default(0),
  google_review_count: integer("google_review_count").notNull().default(0),
  observations: text("observations"),
  contact_status: text("contact_status").notNull().default("pending"),
  contact_date: timestamp("contact_date", { withTimezone: true }),
  conversion_status: text("conversion_status").notNull().default("not_converted"),
  conversion_date: timestamp("conversion_date", { withTimezone: true }),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => dayjs().toDate()),
});

export const leadTimelineEntries = pgTable("lead_timeline_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  lead_id: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  author_user_id: text("author_user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  entry_type: text("entry_type").notNull().default("note"),
  channel: text("channel"),
  direction: text("direction"),
  body: text("body").notNull(),
  outcome: text("outcome"),
  occurred_at: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  follow_up_at: timestamp("follow_up_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => dayjs().toDate()),
});

