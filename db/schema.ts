import { pgTable, text, timestamp, boolean, integer, json, primaryKey, unique, pgEnum, doublePrecision } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// --- ENUMS ---
export const subscriptionPlanEnum = pgEnum("SubscriptionPlan", ["FREE", "PRO", "ENTERPRISE"]);
export const botStatusEnum = pgEnum("BotStatus", ["ACTIVE", "INACTIVE", "DISCONNECTED"]);
export const flowStatusEnum = pgEnum("FlowStatus", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const nodeTypeEnum = pgEnum("NodeType", ["TRIGGER", "MESSAGE", "IMAGE", "VIDEO", "AUDIO", "INPUT", "CONDITION", "DELAY", "ACTION"]);
export const messageTypeEnum = pgEnum("MessageType", ["TEXT", "IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "LOCATION"]);
export const messageSenderEnum = pgEnum("MessageSender", ["USER", "BOT", "AGENT"]);
export const campaignStatusEnum = pgEnum("CampaignStatus", ["DRAFT", "SCHEDULED", "RUNNING", "PAUSED", "COMPLETED", "FAILED"]);
export const paymentProviderEnum = pgEnum("PaymentProvider", ["PUSHINPAY", "ASAAS", "MERCADOPAGO"]);
export const transactionStatusEnum = pgEnum("TransactionStatus", ["PENDING", "PAID", "EXPIRED", "REFUNDED"]);

// --- AUTH ---

export const users = pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    password: text("password"),
    image: text("image"),
    plan: subscriptionPlanEnum("plan").default("FREE"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
    "accounts",
    {
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
        createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
        updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    },
    (account) => ({
        compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
    })
);

export const sessions = pgTable("sessions", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const verificationTokens = pgTable(
    "verification_tokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);

// --- APP CORE ---

export const bots = pgTable("bots", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    token: text("token").notNull().unique(),
    username: text("username"),
    status: botStatusEnum("status").default("INACTIVE"),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),

    // Meta Tracking
    pixelId: text("pixelId"),
    capiToken: text("capiToken"),
    testEventCode: text("testEventCode"),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const tags = pgTable("tags", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    color: text("color").default("#ff5100"),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    botId: text("botId").references(() => bots.id, { onDelete: "set null" }), // Nullable (Global)

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    uniqueTag: unique().on(t.userId, t.name, t.botId),
}));

export const flows = pgTable("flows", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    isDefault: boolean("isDefault").default(false).notNull(),
    status: flowStatusEnum("status").default("DRAFT"),
    botId: text("botId").notNull().references(() => bots.id, { onDelete: "cascade" }),
    shareCode: text("shareCode").unique(),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const flowNodes = pgTable("flow_nodes", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    flowId: text("flowId").notNull().references(() => flows.id, { onDelete: "cascade" }),
    type: nodeTypeEnum("type").notNull(),
    positionX: doublePrecision("positionX").notNull(),
    positionY: doublePrecision("positionY").notNull(),
    data: json("data").notNull(), // Node config

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const flowEdges = pgTable("flow_edges", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    flowId: text("flowId").notNull().references(() => flows.id, { onDelete: "cascade" }),
    sourceNodeId: text("sourceNodeId").notNull(),
    sourceHandle: text("sourceHandle"),
    targetNodeId: text("targetNodeId").notNull(),
    targetHandle: text("targetHandle"),
    label: text("label"),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    botId: text("botId").notNull().references(() => bots.id, { onDelete: "cascade" }),
    telegramChatId: text("telegramChatId").notNull(),
    telegramUserId: text("telegramUserId"),
    firstName: text("firstName"),
    lastName: text("lastName"),
    username: text("username"),
    status: text("status"),
    tags: text("tags").array(),

    waitingForNodeId: text("waitingForNodeId"),
    waitingTimeout: timestamp("waitingTimeout", { mode: "date" }),

    // Tracking
    ip: text("ip"),
    city: text("city"),
    state: text("state"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    utmSource: text("utmSource"),
    utmMedium: text("utmMedium"),
    utmCampaign: text("utmCampaign"),
    utmContent: text("utmContent"),
    utmTerm: text("utmTerm"),
    fbc: text("fbc"),
    fbp: text("fbp"),

    isPaused: boolean("isPaused").default(false).notNull(),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
}, (c) => ({
    uniqueBotChat: unique().on(c.botId, c.telegramChatId),
}));

export const messages = pgTable("messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    content: text("content"),
    type: messageTypeEnum("type").default("TEXT"),
    sender: messageSenderEnum("sender").notNull(),
    mediaUrl: text("mediaUrl"),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    status: campaignStatusEnum("status").default("DRAFT"),
    scheduledAt: timestamp("scheduledAt", { mode: "date" }),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    botId: text("botId").references(() => bots.id, { onDelete: "set null" }),
    flowId: text("flowId").references(() => flows.id, { onDelete: "set null" }),

    totalLeads: integer("totalLeads").default(0).notNull(),
    sentCount: integer("sentCount").default(0).notNull(),
    deliveredCount: integer("deliveredCount").default(0).notNull(),
    readCount: integer("readCount").default(0).notNull(),
    failedCount: integer("failedCount").default(0).notNull(),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const campaignLeads = pgTable("campaign_leads", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
    botId: text("botId").references(() => bots.id, { onDelete: "cascade" }),
    telegramChatId: text("telegramChatId").notNull(),
    status: text("status").default("PENDING").notNull(),
    error: text("error"),
    sentAt: timestamp("sentAt", { mode: "date" }),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
}, (cl) => ({
    uniqueCampaignLead: unique().on(cl.campaignId, cl.telegramChatId),
}));

export const pressells = pgTable("pressells", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    vslUrl: text("vslUrl").notNull(),
    buttonText: text("buttonText").default("Continuar no Telegram").notNull(),
    pixelId: text("pixelId"),
    safeUrl: text("safeUrl"),
    config: json("config"),
    botId: text("botId").notNull().references(() => bots.id, { onDelete: "cascade" }),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const leadTracking = pgTable("lead_tracking", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    ip: text("ip"),
    city: text("city"),
    state: text("state"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    utmSource: text("utmSource"),
    utmMedium: text("utmMedium"),
    utmCampaign: text("utmCampaign"),
    utmContent: text("utmContent"),
    utmTerm: text("utmTerm"),
    pressellId: text("pressellId").references(() => pressells.id, { onDelete: "set null" }),
    fbc: text("fbc"),
    fbp: text("fbp"),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const paymentCredentials = pgTable("payment_credentials", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    provider: paymentProviderEnum("provider").notNull(),
    token: text("token").notNull(),
    secret: text("secret"),
    description: text("description"),
    isActive: boolean("isActive").default(true).notNull(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
}, (pc) => ({
    uniqueUserProvider: unique().on(pc.userId, pc.provider),
}));

export const transactions = pgTable("transactions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    externalId: text("externalId").unique(),
    provider: paymentProviderEnum("provider").notNull(),
    amount: integer("amount").notNull(), // cents
    status: transactionStatusEnum("status").default("PENDING"),
    pixCopyPaste: text("pixCopyPaste"),
    pixQrCodeBase64: text("pixQrCodeBase64"),
    paidTag: text("paidTag"),
    metadata: json("metadata"),
    conversationId: text("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    paidAt: timestamp("paidAt", { mode: "date" }),
    expiresAt: timestamp("expiresAt", { mode: "date" }),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});


// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    bots: many(bots),
    tags: many(tags),
    campaigns: many(campaigns),
    paymentCredentials: many(paymentCredentials),
}));

export const botsRelations = relations(bots, ({ one, many }) => ({
    user: one(users, { fields: [bots.userId], references: [users.id] }),
    flows: many(flows),
    tags: many(tags),
    conversations: many(conversations),
    campaigns: many(campaigns),
    pressells: many(pressells),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
    user: one(users, { fields: [tags.userId], references: [users.id] }),
    bot: one(bots, { fields: [tags.botId], references: [bots.id] }),
}));

export const flowsRelations = relations(flows, ({ one, many }) => ({
    bot: one(bots, { fields: [flows.botId], references: [bots.id] }),
    nodes: many(flowNodes),
    edges: many(flowEdges),
}));

export const flowNodesRelations = relations(flowNodes, ({ one }) => ({
    flow: one(flows, { fields: [flowNodes.flowId], references: [flows.id] }),
}));

export const flowEdgesRelations = relations(flowEdges, ({ one }) => ({
    flow: one(flows, { fields: [flowEdges.flowId], references: [flows.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    bot: one(bots, { fields: [conversations.botId], references: [bots.id] }),
    messages: many(messages),
    transactions: many(transactions),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
    user: one(users, { fields: [campaigns.userId], references: [users.id] }),
    bot: one(bots, { fields: [campaigns.botId], references: [bots.id] }),
    flow: one(flows, { fields: [campaigns.flowId], references: [flows.id] }),
    leads: many(campaignLeads),
}));

export const campaignLeadsRelations = relations(campaignLeads, ({ one }) => ({
    campaign: one(campaigns, { fields: [campaignLeads.campaignId], references: [campaigns.id] }),
    bot: one(bots, { fields: [campaignLeads.botId], references: [bots.id] }),
}));

export const pressellsRelations = relations(pressells, ({ one }) => ({
    bot: one(bots, { fields: [pressells.botId], references: [bots.id] }),
    user: one(users, { fields: [pressells.userId], references: [users.id] }),
}));

export const leadTrackingRelations = relations(leadTracking, ({ one }) => ({
    pressell: one(pressells, { fields: [leadTracking.pressellId], references: [pressells.id] }),
}));

export const paymentCredentialsRelations = relations(paymentCredentials, ({ one }) => ({
    user: one(users, { fields: [paymentCredentials.userId], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    conversation: one(conversations, { fields: [transactions.conversationId], references: [conversations.id] }),
}));
