import { decode, encode } from "gpt-tokenizer";

function preprocessMarkdown(markdown: string): string {
  // remove all whitespace (spaces, newlines, tabs)
  return markdown.replace(/\s+/g, "");
}

function shouldChunk(markdown: string, maxLength = 4000): boolean {
  const cleaned = preprocessMarkdown(markdown);
  return cleaned.length > maxLength;
}
export function chunkMarkdown(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const tokens = encode(text);

  const chunks: string[] = [];
  for (let i = 0; i < tokens.length; i += chunkSize - overlap) {
    const chunkTokens = tokens.slice(i, i + chunkSize);
    chunks.push(decode(chunkTokens));
  }

  return chunks;
}
