import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getShortfilmsPage } from "~/lib/queries";
import { getFileUrl } from "~/lib/sanity";
import Layout from "~/components/Layout";
import VideoSlider from "~/components/VideoSlider";

export const meta: MetaFunction = () => [
  { title: "Shortfilms — SANSHOOTS®" },
];

export async function loader(_: LoaderFunctionArgs) {
  const data = await getShortfilmsPage();
  return json({ data });
}

export default function ShortfilmsPage() {
  const { data } = useLoaderData<typeof loader>();

  const slides = (data?.projects || []).map((p: any) => ({
    mp4Src: p.sliderVideoMp4 ? getFileUrl(p.sliderVideoMp4) : null,
    webmSrc: p.sliderVideoWebm ? getFileUrl(p.sliderVideoWebm) : null,
    fallbackImageSrc: p.posterImage?.asset?.url || null,
    title: p.title,
    tag: p.tag,
    linkTo: `/shortfilms/${p.slug?.current}`,
  }));

  return (
    <Layout>
      <div className="page-header text-center pt-24 lg:pt-32 px-d">
        <h1>{data?.page?.pageTitle || "Shortfilms"}</h1>
      </div>
      <VideoSlider slides={slides} />
    </Layout>
  );
}
