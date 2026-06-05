import { json } from "@remix-run/node";
import { client } from "~/lib/sanity";

// Re-uses the shared Sanity client (hardcoded projectId/dataset in ~/lib/sanity.ts)
// so this route never crashes on import due to missing env vars.

export async function loader() {
  try {
    const query = `*[_type == "project"]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      client,
      projectDate,
      technologies,
      "mainImageUrl": mainImage.asset->url
    }`;

    const projects = await client.fetch(query);

    if (!projects) {
      console.warn("No projects found in Sanity");
      return json([]);
    }

    return json(projects);
  } catch (error) {
    console.error("Error in Sanity API route:", {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return json(
      {
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
