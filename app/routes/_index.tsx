import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getHomePage, getAboutPage } from "~/lib/queries";
import { getFileUrl } from "~/lib/sanity";
import { lazy, Suspense } from "react";
import Layout from "~/components/Layout";
import Hero from "~/components/Hero";
import Services from "~/components/Services";
import type { RingProject } from "~/components/ProjectRing";

const ProjectRing = lazy(() => import("~/components/ProjectRing"));

export const meta: MetaFunction = () => [
  { title: "SANSHOOTS®" },
  {
    name: "description",
    content:
      "SANSHOOTS® is an award-winning videography studio founded by Hassan Musa based in Los Angeles, CA.",
  },
];

export async function loader(_: LoaderFunctionArgs) {
  const [data, about] = await Promise.all([getHomePage(), getAboutPage()]);
  return json({ data, about });
}

export default function Index() {
  const { data, about } = useLoaderData<typeof loader>();

  // Use featuredProjects if populated, otherwise fall back to sliderProjects
  const ringSource =
    data?.featuredProjects?.length
      ? data.featuredProjects
      : data?.sliderProjects ?? [];

  const featuredProjects: RingProject[] = ringSource.map((p: any) => ({
    _id: p._id,
    title: p.title,
    tag: p.tag,
    slug: p.slug,
    category: p.category,
    posterImage: p.posterImage ?? null,
    mp4Src: p.sliderVideoMp4 ? getFileUrl(p.sliderVideoMp4) : null,
    webmSrc: p.sliderVideoWebm ? getFileUrl(p.sliderVideoWebm) : null,
    linkTo: `/${p.category}/${p.slug?.current}`,
  }));

  if (typeof window !== "undefined") {
    console.log(
      "[ProjectRing] source:",
      data?.featuredProjects?.length ? "featuredProjects" : "sliderProjects (fallback)",
      "| count:", featuredProjects.length
    );
    if (featuredProjects[0]) {
      console.log("[ProjectRing] first project:", {
        title: featuredProjects[0].title,
        posterUrl: featuredProjects[0].posterImage?.asset?.url ?? "NULL",
        mp4: featuredProjects[0].mp4Src ?? "NULL",
      });
    }
  }

  const services = (data?.services || []).map((s: any) => ({
    name: s.name,
    video: s.video ? getFileUrl(s.video) : null,
  }));

  const targetImageUrl: string | undefined =
    about?.targetImageDesktop?.asset?.url ?? undefined;

  return (
    <Layout>
      <Hero />
      <Suspense fallback={<div style={{ height: "80vh" }} />}>
        <ProjectRing
          projects={featuredProjects}
          targetImageUrl={targetImageUrl}
        />
      </Suspense>
      <Services services={services} />
    </Layout>
  );
}
