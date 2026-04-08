import Link from "next/link";
import { FeaturedBuild } from "@/types/build";

interface FeaturedBuildCardProps {
  build: FeaturedBuild;
}

export function FeaturedBuildCard({ build }: FeaturedBuildCardProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 16, padding: 16 }}>
      <div style={{ aspectRatio: "1 / 1", borderRadius: 12, background: "#eee" }} />
      <h3 style={{ marginTop: 16, fontSize: 22 }}>{build.buildName}</h3>
      <p style={{ marginTop: 8, color: "#666", fontSize: 14 }}>{build.caption}</p>
      <Link
        href={`/gallery/${build.slug}`}
        style={{
          display: "inline-block",
          marginTop: 16,
          borderRadius: 10,
          background: "#111",
          color: "#fff",
          padding: "10px 16px",
        }}
      >
        View Build
      </Link>
    </div>
  );
}
