import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

// Import Nomads models and normalization utilities
import VisaRuleV2 from "../models/VisaRuleV2.js";
import {
  normalizeCountryKey,
  normalizeVisaRequirement,
} from "../controllers/visaRuleController.js";

// ---------------------------------------------------------------------------
// 1. DATABASE CONNECTION (CRITICAL: Logs must go to stderr, not stdout!)
// ---------------------------------------------------------------------------
async function initDatabase() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error("[Nomads MCP Error] MONGO_URL is missing in backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.error("[Nomads MCP] Successfully connected to MongoDB.");
  } catch (err) {
    console.error("[Nomads MCP DB Error]", err.message);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// 2. DEFINE MCP SERVER
// ---------------------------------------------------------------------------
const server = new Server(
  {
    name: "nomads-visa-rules",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ---------------------------------------------------------------------------
// 3. TOOL DEFINITIONS (What the AI agent sees)
// ---------------------------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "lookup_visa_rule",
        description:
          "Look up the current visa requirement and duration for a given passport origin and destination country in Nomads visarulesv2.",
        inputSchema: {
          type: "object",
          properties: {
            passport: {
              type: "string",
              description: "Origin passport country (e.g. 'India', 'Germany')",
            },
            destination: {
              type: "string",
              description: "Destination country (e.g. 'Thailand', 'Portugal')",
            },
          },
          required: ["passport", "destination"],
        },
      },
      {
        name: "preview_visa_rule_update",
        description:
          "Dry-run comparison report: Shows current rule vs proposed new requirement and duration before committing any changes to the database.",
        inputSchema: {
          type: "object",
          properties: {
            passport: {
              type: "string",
              description: "Origin passport country",
            },
            destination: {
              type: "string",
              description: "Destination country",
            },
            newRequirement: {
              type: "string",
              description:
                "Proposed requirement (e.g. 'visa free', 'visa on arrival', 'e-visa', 'physical visa')",
            },
            newDurationDays: {
              type: ["number", "null"],
              description: "Allowed stay duration in days (or null if indefinite/not specified)",
            },
          },
          required: ["passport", "destination", "newRequirement"],
        },
      },
      {
        name: "update_visa_rule",
        description:
          "Commits an update to a visa rule in visarulesv2. Properly updates normalized keys so frontend search works accurately.",
        inputSchema: {
          type: "object",
          properties: {
            passport: {
              type: "string",
              description: "Origin passport country",
            },
            destination: {
              type: "string",
              description: "Destination country",
            },
            requirement: {
              type: "string",
              description:
                "New requirement (e.g. 'visa free', 'visa on arrival', 'e-visa', 'physical visa')",
            },
            durationDays: {
              type: ["number", "null"],
              description: "Allowed stay duration in days (or null)",
            },
            createIfMissing: {
              type: "boolean",
              description: "Whether to insert a new rule if none exists (default: false)",
              default: false,
            },
          },
          required: ["passport", "destination", "requirement"],
        },
      },
    ],
  };
});

// ---------------------------------------------------------------------------
// 4. TOOL EXECUTION HANDLERS
// ---------------------------------------------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // ---------------------------------------------------------
    // TOOL 1: lookup_visa_rule
    // ---------------------------------------------------------
    if (name === "lookup_visa_rule") {
      const { passport, destination } = args;
      const normalizedPassport = normalizeCountryKey(passport);
      const normalizedDestination = normalizeCountryKey(destination);

      const rule = await VisaRuleV2.findOne({
        $or: [{ passport }, { normalizedPassport }],
        $and: [
          {
            $or: [
              { destination },
              { normalizedDestination },
            ],
          },
        ],
      }).lean();

      if (!rule) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  found: false,
                  message: `No visa rule found for passport "${passport}" -> destination "${destination}".`,
                  searchedWith: { normalizedPassport, normalizedDestination },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                found: true,
                passport: rule.passport,
                destination: rule.destination,
                requirement: rule.requirement,
                durationDays: rule.durationDays,
                updatedAt: rule.updatedAt,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // ---------------------------------------------------------
    // TOOL 2: preview_visa_rule_update (Before-update Report)
    // ---------------------------------------------------------
    if (name === "preview_visa_rule_update") {
      const { passport, destination, newRequirement, newDurationDays } = args;
      const normalizedPassport = normalizeCountryKey(passport);
      const normalizedDestination = normalizeCountryKey(destination);
      const cleanedRequirement = normalizeVisaRequirement(newRequirement);

      const existingRule = await VisaRuleV2.findOne({
        $or: [{ passport }, { normalizedPassport }],
        $and: [
          {
            $or: [
              { destination },
              { normalizedDestination },
            ],
          },
        ],
      }).lean();

      const report = {
        action: existingRule ? "UPDATE_EXISTING_RECORD" : "NEW_RECORD_CREATION",
        recordId: existingRule?._id || "NEW",
        passport: {
          input: passport,
          normalizedKey: normalizedPassport,
        },
        destination: {
          input: destination,
          normalizedKey: normalizedDestination,
        },
        comparison: {
          requirement: {
            current: existingRule ? existingRule.requirement : "(none)",
            proposed: cleanedRequirement,
            changed: existingRule ? existingRule.requirement !== cleanedRequirement : true,
          },
          durationDays: {
            current: existingRule ? existingRule.durationDays : "(none)",
            proposed: newDurationDays !== undefined ? newDurationDays : null,
            changed: existingRule ? existingRule.durationDays !== newDurationDays : true,
          },
        },
        impact: existingRule
          ? "Modifying this will immediately alter frontend AI search filtering and duration badges."
          : "Record does not exist yet. You will need createIfMissing: true to insert it.",
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(report, null, 2),
          },
        ],
      };
    }

    // ---------------------------------------------------------
    // TOOL 3: update_visa_rule (Commit to DB)
    // ---------------------------------------------------------
    if (name === "update_visa_rule") {
      const {
        passport,
        destination,
        requirement,
        durationDays = null,
        createIfMissing = false,
      } = args;

      const normalizedPassport = normalizeCountryKey(passport);
      const normalizedDestination = normalizeCountryKey(destination);
      const cleanedRequirement = normalizeVisaRequirement(requirement);

      // Find existing
      let rule = await VisaRuleV2.findOne({
        $or: [{ passport }, { normalizedPassport }],
        $and: [
          {
            $or: [
              { destination },
              { normalizedDestination },
            ],
          },
        ],
      });

      if (!rule && !createIfMissing) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: No existing rule found for ${passport} -> ${destination}. Set createIfMissing: true if you want to insert a new entry.`,
            },
          ],
        };
      }

      if (!rule) {
        // Create new
        rule = new VisaRuleV2({
          passport: passport.trim(),
          normalizedPassport,
          destination: destination.trim(),
          normalizedDestination,
          requirement: cleanedRequirement,
          durationDays: durationDays !== undefined ? durationDays : null,
        });
        await rule.save();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  operation: "INSERTED_NEW_RECORD",
                  rule,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Update existing
      const previousState = {
        requirement: rule.requirement,
        durationDays: rule.durationDays,
      };

      rule.requirement = cleanedRequirement;
      rule.durationDays = durationDays !== undefined ? durationDays : null;
      rule.normalizedPassport = normalizedPassport;
      rule.normalizedDestination = normalizedDestination;

      await rule.save();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                operation: "UPDATED_EXISTING_RECORD",
                previousState,
                currentState: {
                  requirement: rule.requirement,
                  durationDays: rule.durationDays,
                  normalizedPassport: rule.normalizedPassport,
                  normalizedDestination: rule.normalizedDestination,
                  updatedAt: rule.updatedAt,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `[MCP Execution Error]: ${error.message}`,
        },
      ],
    };
  }
});

// ---------------------------------------------------------------------------
// 5. START SERVER (STDIO TRANSPORT)
// ---------------------------------------------------------------------------
async function main() {
  await initDatabase();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Nomads MCP] Visa Rule MCP Server is listening on stdio.");
}

main().catch((err) => {
  console.error("[Nomads MCP Fatal]", err);
  process.exit(1);
});
