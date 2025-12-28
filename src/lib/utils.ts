import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { instance } from "./axios";
import { createHash } from "crypto";
import { decode, encode } from "gpt-tokenizer";

export const key = new TextEncoder().encode(process?.env.JWT_SECRET);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chunkText(
  text: string,
  maxTokens = 500,
  overlap = 50
): string[] {
  const tokens = encode(text);
  const chunks: string[] = [];

  for (let i = 0; i < tokens.length; i += maxTokens - overlap) {
    const chunkTokens = tokens.slice(i, i + maxTokens);
    const chunk = decode(chunkTokens); // turn tokens back into string
    chunks.push(chunk);
  }

  return chunks;
}

export async function getArticleDataByURL(url: string) {
  const res = await instance(`/get-article?url=${url}`);
  if (res?.status !== 200) {
    return null;
  }
  // console.log(res);
  return res.data?.data;
}

export function isValidUUID(uuid: string) {
  // Regular expression to match RFC 4122 UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function getSlug(str: string) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  const to = "aaaaeeeeiiiioooouuuunc------";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
}

export const capitalizeFirstLetter = (word: string): string => {
  return `${word?.at(0)!.toUpperCase()}${word?.slice(1).toLowerCase()}`;
};

export const getAvatarByUserInitials = (name: string) => {
  if (name.length === 0) {
    throw new Error("Name is required to create an avatar");
  }
  return `https://api.dicebear.com/9.x/initials/svg?seed=${name}&scale=100`;
};

export const generatePassword = (email: string, length = 8) => {
  if (!email) {
    throw new Error("Email is required to generate a password");
  }

  // Create a hash using SHA256
  const hash = createHash("sha256").update(email).digest("hex");

  // Truncate or extend the hash to the desired length
  return hash.slice(0, length);
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
