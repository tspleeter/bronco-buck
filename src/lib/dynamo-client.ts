import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// No explicit credentials — relies on IAM compute role assigned in Amplify.
// The bronco-buck-compute-role has AmazonDynamoDBFullAccess attached.

const client = new DynamoDBClient({
  region: process.env.DYNAMO_REGION ?? "us-east-1",
});

export const docClient = DynamoDBDocumentClient.from(client);

// Raw client for control-plane operations (DescribeTable/CreateTable). The
// document client only exposes data-plane commands.
export const dynamoClient = client;
