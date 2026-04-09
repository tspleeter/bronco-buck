import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Shared DynamoDB client used by both dev-db.ts and orders-db.ts.
// Uses DYNAMO_ prefixed env vars since Amplify blocks AWS_ prefix.

const client = new DynamoDBClient({
  region: process.env.DYNAMO_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.DYNAMO_SECRET_KEY ?? "",
  },
});

export const docClient = DynamoDBDocumentClient.from(client);
