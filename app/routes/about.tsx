import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getAboutPage } from "~/lib/queries";
import { getFileUrl } from "~/lib/sanity";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => [
  { title: "About — SANSHOOTS®" },
];

export async function loader(_: LoaderFunctionArgs) {
  const data = await getAboutPage();
  return json({ data });
}

export default function About() {
  const { data } = useLoaderData<typeof loader>();

  const aboutVideoUrl = data?.aboutVideo ? getFileUrl(data.aboutVideo) : null;
  const targetDesktopUrl = data?.targetImageDesktop?.asset?.url || null;
  const targetMobileUrl = data?.targetImageMobile?.asset?.url || null;
  const bottomImageUrl = data?.bottomImage?.asset?.url || null;

  return (
    <Layout>
      <div className="page-header text-center pt-24 lg:pt-32 px-d">
        <h1>About</h1>
      </div>

      {/* About video card */}
      <div className="px-d">
        <h5 className="mb-4">Watch the film</h5>
        {aboutVideoUrl && (
          <div className="about-card">
            <video
              src={aboutVideoUrl}
              controls
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <h5 className="mt-12">{data?.subheadline || "About Sanshoots"}</h5>
        <h3 className="text-justify mt-4">
          {data?.headline || "One part left brain, one part right brain. One whole creative video agency."}
        </h3>
      </div>

      {/* Target image */}
      {(targetDesktopUrl || targetMobileUrl) && (
        <div className="mt-16">
          {targetDesktopUrl && (
            <img
              src={targetDesktopUrl}
              alt="Target"
              className="hidden md:block w-full"
              style={{ objectFit: "cover" }}
            />
          )}
          {targetMobileUrl && (
            <img
              src={targetMobileUrl}
              alt="Target"
              className="block md:hidden w-full"
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
      )}

      {/* Bottom full-width image */}
      {bottomImageUrl && (
        <div className="flex w-full justify-center mt-24">
          <img
            src={bottomImageUrl}
            alt="Sanshoots"
            style={{ width: "100%", maxHeight: "800px", objectFit: "cover" }}
          />
        </div>
      )}


    </Layout>
  );
}
