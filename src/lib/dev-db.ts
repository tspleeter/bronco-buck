import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { SharedBuild } from "@/types/shared-build";

// Uses the existing BroncoBuckBuilds DynamoDB table.
// The table's partition key is "id" (String), so we map shareId → id
// when writing and reading. The full SharedBuild object is stored
// as additional attributes alongside the id key.

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME ?? "BroncoBuckBuilds";

/**
 * Write a single shared build to DynamoDB.
 * Maps shareId → id to match the table's partition key.
 */
export async function writeSharedBuild(item: SharedBuild): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: item.shareId, // partition key
        ...item,
      },
    })
  );
}

/**
 * Read a single shared build by shareId.
 * Returns undefined if not found.
 */
export async function readSharedBuildById(
  shareId: string
): Promise<SharedBuild | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: shareId }, // partition key is "id"
    })
  );

  if (!result.Item) return undefined;

  // Strip the "id" key we added — the rest is the SharedBuild
  const { id: _id, ...build } = result.Item;
  return build as SharedBuild;
}

/**
 * Read all shared builds.
 * Scan is fine for low volume. If the table grows large (1000+ items),
 * add a GSI on createdAt and switch to Query.
 */
export async function readAllSharedBuilds(): Promise<SharedBuild[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  const items = (result.Items ?? []).map(({ id: _id, ...rest }) => rest as SharedBuild);

  // Sort featured first, then by newest createdAt
  return items.sort((a, b) => {
    if ((a.isFeatured ?? false) !== (b.isFeatured ?? false)) {
      return a.isFeatured ? -1 : 1;
    }
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}
