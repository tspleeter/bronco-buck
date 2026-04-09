import featuredBuilds from "@/data/featured-builds.json";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BuildDetailPageProps {
  params: Promise<{
    buildSlug: string;
  }>;
}

export default async function BuildDetailPage({ params }: BuildDetailPageProps) {
  const { buildSlug } = await params;
  const build = featuredBuilds.find((item) => item.slug === buildSlug);

  if (!build) return notFound();

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          border: "1px solid #ddd",
          background: "#fff",
          padding: 32,
          borderRadius: 24,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Featured Build
        </p>

        <h1 style={{ marginTop: 12, fontSize: 64, fontWeight: 900 }}>
          {build.buildName}
        </h1>

        <p style={{ marginTop: 16, maxWidth: 700, fontSize: 20, color: "#555" }}>
          {build.caption}
        </p>

        <div
          style={{
            marginTop: 32,
            aspectRatio: "16 / 9",
            borderRadius: 16,
            background: "#eee",
          }}
        />

        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Fixed: was /build/bronco-buddy-classic (typo) */}
          <Link
            href={`/build/bronco-buck-classic?featured=${build.slug}`}
            style={{
              borderRadius: 12,
              background: "#111",
              color: "#fff",
              padding: "14px 24px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Build This One
          </Link>

          <Link
            href="/gallery"
            style={{
              borderRadius: 12,
              border: "1px solid #ccc",
              background: "#fff",
              padding: "14px 24px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
