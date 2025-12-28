// import Editor from "@/components/editor/editor";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import toast from "react-hot-toast";
import { getDocument } from "./actions";
import DocumentPage from "@/components/documents/DocumentPage";
import { Metadata } from "next";
import { $generateHtmlFromNodes } from "@lexical/html";
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // read route params
  const id = (await params).id;

  const { data } = await getDocument(id);

  return {
    title: `${data?.title} | Pluto`,
  };
}

export default async function Page({ params }: PageProps) {
  const id = (await params)?.id;
  if (!id) return notFound();
  const { data, error } = await getDocument(id);
  if (error) {
    toast.error(error);
    return;
  }
  console.log({ data });
  // In a headless mode, you need to initialize a headless browser implementation such as JSDom.

  return <DocumentPage document={data!} />;
}
