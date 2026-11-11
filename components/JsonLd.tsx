// Structured data as a script tag, the way the Next.js JSON-LD guide recommends.
// `<` is escaped so no string in the data can close the tag.
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }} />;
}
