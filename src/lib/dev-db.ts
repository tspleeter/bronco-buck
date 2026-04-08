import fs from "fs";
import path from "path";
import { SharedBuild } from "@/types/shared-build";

const filePath = path.join(process.cwd(), "dev-db.json");

export function readDB(): SharedBuild[] {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as SharedBuild[];
}

export function writeDB(data: SharedBuild[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}