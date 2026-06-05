import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getProject } from "~/lib/queries";
import ProjectPage from "~/components/ProjectPage";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.project?.title || "Project"} — SANSHOOTS®` },
];

export async function loader({ params }: LoaderFunctionArgs) {
  const project = await getProject(params.slug!);
  if (!project) throw new Response("Not Found", { status: 404 });
  return json({ project });
}

export default function ShowreelProject() {
  const { project } = useLoaderData<typeof loader>();
  return (
    <ProjectPage
      title={project.title}
      vimeoUrl={project.vimeoUrl}
      projectVideo={project.projectVideoMp4?.asset?.url ?? null}
      location={project.location}
      coordinates={project.coordinates}
      tag={project.tag}
      pageBuilder={project.pageBuilder || []}
      nextProject={project.nextProject}
    />
  );
}
