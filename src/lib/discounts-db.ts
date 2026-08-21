import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
  ResourceInUseException,
} from "@aws-sdk/client-dynamodb";
import { docClient, dynamoClient } from "@/lib/dynamo-client";
import { Discount } from "@/types/discount";
import { normalizeCode } from "@/lib/discount-logic";

const TABLE_NAME = process.env.DYNAMO_DISCOUNTS_TABLE ?? "BroncoBuckDiscounts";

/**
 * Thrown when the discounts table doesn't exist yet. On the admin path we kick
 * off table creation and surface this so the UI can say "initializing, retry in
 * a moment" — DynamoDB tables take a few seconds to go ACTIVE. The public
 * validate path never sees this (getDiscount fails safe to "not found").
 */
export class TableInitializingError extends Error {
  constructor() {
    super("Discounts table is initializing");
    this.name = "TableInitializingError";
  }
}

/** Thrown by createDiscount when the code already exists. */
export class DuplicateCodeError extends Error {
  constructor(code: string) {
    super(`Discount code ${code} already exists`);
    this.name = "DuplicateCodeError";
  }
}

let tableReady = false;

async function createTable(): Promise<void> {
  try {
    await dynamoClient.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [{ AttributeName: "code", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "code", KeyType: "HASH" }],
      }),
    );
  } catch (err) {
    // Another concurrent request already started creation — fine.
    if (err instanceof ResourceInUseException) return;
    throw err;
  }
}

/**
 * Ensure the discounts table exists and is ACTIVE. If it's missing, start
 * creating it and throw TableInitializingError (the caller asks the user to
 * retry). Used only on the admin (write/list) path.
 */
async function ensureTable(): Promise<void> {
  if (tableReady) return;
  try {
    const desc = await dynamoClient.send(
      new DescribeTableCommand({ TableName: TABLE_NAME }),
    );
    if (desc.Table?.TableStatus === "ACTIVE") {
      tableReady = true;
      return;
    }
    // CREATING / UPDATING — not usable yet.
    throw new TableInitializingError();
  } catch (err) {
    if (err instanceof ResourceNotFoundException) {
      await createTable();
      throw new TableInitializingError();
    }
    throw err;
  }
}

/**
 * Fetch a single code. Fails SAFE for the public checkout path: if the table
 * doesn't exist yet, returns undefined (treated as an invalid code) rather than
 * throwing — a missing discounts table must never break checkout.
 */
export async function getDiscount(
  code: string,
): Promise<Discount | undefined> {
  const norm = normalizeCode(code);
  if (!norm) return undefined;
  try {
    const result = await docClient.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { code: norm } }),
    );
    return result.Item as Discount | undefined;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) return undefined;
    throw err;
  }
}

export async function listDiscounts(): Promise<Discount[]> {
  await ensureTable();
  const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = (result.Items ?? []) as Discount[];
  return items.sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt)),
  );
}

export interface CreateDiscountInput {
  code: string;
  type: Discount["type"];
  value: number;
  active?: boolean;
  maxRedemptions?: number | null;
  minSubtotal?: number | null;
  expiresAt?: string | null;
  description?: string;
}

export async function createDiscount(
  input: CreateDiscountInput,
): Promise<Discount> {
  await ensureTable();
  const now = new Date().toISOString();
  const discount: Discount = {
    code: normalizeCode(input.code),
    type: input.type,
    value: input.value,
    active: input.active ?? true,
    timesUsed: 0,
    maxRedemptions: input.maxRedemptions ?? null,
    minSubtotal: input.minSubtotal ?? null,
    expiresAt: input.expiresAt ?? null,
    description: input.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: discount,
        ConditionExpression: "attribute_not_exists(code)",
      }),
    );
  } catch (err) {
    if (
      err instanceof Error &&
      err.name === "ConditionalCheckFailedException"
    ) {
      throw new DuplicateCodeError(discount.code);
    }
    throw err;
  }

  return discount;
}

export interface UpdateDiscountInput {
  type?: Discount["type"];
  value?: number;
  active?: boolean;
  maxRedemptions?: number | null;
  minSubtotal?: number | null;
  expiresAt?: string | null;
  description?: string | null;
}

export async function updateDiscount(
  code: string,
  patch: UpdateDiscountInput,
): Promise<Discount | undefined> {
  await ensureTable();
  const norm = normalizeCode(code);

  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };
  const sets: string[] = ["updatedAt = :updatedAt"];

  const fields: [keyof UpdateDiscountInput, string][] = [
    ["type", "type"],
    ["value", "value"],
    ["active", "active"],
    ["maxRedemptions", "maxRedemptions"],
    ["minSubtotal", "minSubtotal"],
    ["expiresAt", "expiresAt"],
    ["description", "description"],
  ];

  for (const [key, attr] of fields) {
    const val = patch[key];
    if (val !== undefined) {
      names[`#${attr}`] = attr;
      values[`:${attr}`] = val;
      sets.push(`#${attr} = :${attr}`);
    }
  }

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { code: norm },
        UpdateExpression: "SET " + sets.join(", "),
        ...(Object.keys(names).length ? { ExpressionAttributeNames: names } : {}),
        ExpressionAttributeValues: values,
        ConditionExpression: "attribute_exists(code)",
        ReturnValues: "ALL_NEW",
      }),
    );
    return result.Attributes as Discount | undefined;
  } catch (err) {
    if (err instanceof Error && err.name === "ConditionalCheckFailedException") {
      return undefined; // code doesn't exist
    }
    throw err;
  }
}

export async function deleteDiscount(code: string): Promise<void> {
  await ensureTable();
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { code: normalizeCode(code) },
    }),
  );
}

/**
 * Atomically bump a code's redemption counter. Best-effort: called after a paid
 * order is stored; a missing table or code must never fail the order, so all
 * errors are swallowed by the caller.
 */
export async function incrementRedemption(code: string): Promise<void> {
  const norm = normalizeCode(code);
  if (!norm) return;
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { code: norm },
        UpdateExpression: "ADD timesUsed :one SET updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":one": 1,
          ":updatedAt": new Date().toISOString(),
        },
        ConditionExpression: "attribute_exists(code)",
      }),
    );
  } catch (err) {
    if (err instanceof ResourceNotFoundException) return;
    if (err instanceof Error && err.name === "ConditionalCheckFailedException") {
      return;
    }
    throw err;
  }
}
