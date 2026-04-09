import {
  PutCommand,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/dynamo-client";
import { SharedBuild } from "@/types/shared-build";

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME ?? "BroncoBuckBuilds";

export async function writeSharedBuild(item: SharedBuild): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: item.shareId,
        ...item,
      },
    })
  );
}

export async function readSharedBuildById(
  shareId: string
): Promise<SharedBuild | undefined> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: shareId },
    })
  );

  if (!result.Item) return undefined;

  const { id: _id, ...build } = result.Item;
  return build as SharedBuild;
}

export async function readAllSharedBuilds(): Promise<SharedBuild[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );

  const items = (result.Items ?? []).map(({ id: _id, ...rest }) => rest as SharedBuild);

  return items.sort((a, b) => {
    if ((a.isFeatured ?? false) !== (b.isFeatured ?? false)) {
      return a.isFeatured ? -1 : 1;
    }
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}
