import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const accessKeyId = process.env.DYNAMO_ACCESS_KEY_ID;
const secretAccessKey = process.env.DYNAMO_SECRET_KEY;
const region = process.env.DYNAMO_REGION ?? "us-east-1";

if (!accessKeyId || !secretAccessKey) {
  console.error("DynamoDB credentials missing:", {
    hasKey: !!accessKeyId,
    hasSecret: !!secretAccessKey,
  });
}

const client = new DynamoDBClient({
  region,
  credentials: accessKeyId && secretAccessKey ? {
    accessKeyId,
    secretAccessKey,
  } : undefined,
});

export const docClient = DynamoDBDocumentClient.from(client);
