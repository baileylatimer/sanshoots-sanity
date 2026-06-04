import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getContactPage } from "~/lib/queries";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => [
  { title: "Contact — SANSHOOTS®" },
];

export async function loader(_: LoaderFunctionArgs) {
  const data = await getContactPage();
  return json({ data });
}

export default function Contact() {
  const { data } = useLoaderData<typeof loader>();
  const typeformRef = useRef<HTMLDivElement>(null);
  const typeformUrl = data?.typeformUrl || "https://form.typeform.com/to/LsunBzR3";

  useEffect(() => {
    if (!typeformRef.current) return;
    // Dynamically import Typeform to avoid SSR issues
    import("@typeform/embed").then(({ createWidget }) => {
      if (typeformRef.current) {
        createWidget(typeformUrl, {
          container: typeformRef.current,
          width: "100%",
          height: "100vh",
        });
      }
    });
  }, [typeformUrl]);

  return (
    <Layout>
      <div className="page-header">
        <h1>Contact</h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "60vh",
          marginTop: "5vh",
          backgroundColor: "#f8f8f8",
          position: "relative",
        }}
      >
        <div
          ref={typeformRef}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            position: "absolute",
            top: "0",
            left: "0",
            border: "none",
          }}
        />
      </div>
    </Layout>
  );
}
