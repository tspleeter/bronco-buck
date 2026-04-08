import { getBuild } from "@/lib/api";
import Link from "next/link";
import CopyLinkButton from "@/components/CopyLinkButton";

export const dynamic = "force-dynamic";

type SavedBuildPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getPreviewImage(bodyColor: string, maneColor: string) {
  return `https://dummyimage.com/400x300/${bodyColor}/ffffff&text=${bodyColor}+Buck+${maneColor}`;
}


export default async function SavedBuildPage({
  params,
}: SavedBuildPageProps) {
  const { id } = await params;

  try {
    const build = await getBuild(id);

    return (
      <main className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-2xl border p-6 shadow-sm">
          <h1 className="text-3xl font-bold mb-2">Saved Bronco Buck Build</h1>
          <p className="text-sm opacity-70 mb-6">
            Your custom build has been saved and is ready to share.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5">
              <h2 className="text-xl font-semibold mb-4">Build Details</h2>

              <div className="space-y-3">
                <p>
                  <strong>ID:</strong> {build.id}
                </p>
                <p>
                  <strong>Body Color:</strong> {build.bodyColor}
                </p>
                <p>
                  <strong>Mane Color:</strong> {build.maneColor}
                </p>
                <p>
                  <strong>Base:</strong> {build.base}
                </p>
                {build.price ? (
                  <p>
                    <strong>Price:</strong> ${build.price}
                  </p>
                ) : null}
                {build.createdAt ? (
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(build.createdAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>

              <div className="rounded-xl border min-h-[280px] flex flex-col items-center justify-center text-center p-6">
                  <img
                    src={getPreviewImage(build.bodyColor, build.maneColor)}
                    alt="Bronco Buck Preview"
                    className="rounded-lg mb-4"
                  />
      
                  <div className="text-lg font-bold mb-2">Bronco Buck</div>
      
                  <p className="mb-2">
                    <strong>Body:</strong> {build.bodyColor}
                  </p>
      
                  <p className="mb-2">
                    <strong>Mane:</strong> {build.maneColor}
                  </p>
      
                  <p className="mb-2">
                    <strong>Base:</strong> {build.base}
                  </p>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <CopyLinkButton />

            <Link
              href="/build"
              className="w-full rounded-xl border px-4 py-3 font-semibold shadow-sm hover:bg-black hover:text-white transition text-center"
            >
              Build Another
            </Link>

            <button className="w-full rounded-xl border px-4 py-3 font-semibold shadow-sm hover:bg-black hover:text-white transition">
              Start Checkout
            </button>
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <main className="w-full max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-2xl border p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Build not found</h1>
          <p className="text-sm opacity-80">
            We could not load that saved build.
          </p>
        </div>
      </main>
    );
  }
}