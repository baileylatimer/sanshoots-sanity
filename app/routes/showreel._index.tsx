import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getShowreelPage } from "~/lib/queries";
import { getFileUrl } from "~/lib/sanity";
import Layout from "~/components/Layout";
import VideoSlider from "~/components/VideoSlider";

export const meta: MetaFunction = () => [
  { title: "Showreel — SANSHOOTS®" },
];

export async function loader(_: LoaderFunctionArgs) {
  const data = await getShowreelPage();
  return json({ data });
}

export default function ShowreelPage() {
  const { data } = useLoaderData<typeof loader>();

  const slides = (data?.projects || []).map((p: any) => ({
    mp4Src: p.sliderVideoMp4 ? getFileUrl(p.sliderVideoMp4) : null,
    webmSrc: p.sliderVideoWebm ? getFileUrl(p.sliderVideoWebm) : null,
    fallbackImageSrc: p.posterImage?.asset?.url || null,
    title: p.title,
    tag: p.tag,
    linkTo: `/showreel/${p.slug?.current}`,
  }));

  return (
    <Layout>
      <div className="page-header">
        <h1>{data?.page?.pageTitle || "Showreel"}</h1>
      </div>
      <VideoSlider slides={slides} />
    </Layout>
  );
}
