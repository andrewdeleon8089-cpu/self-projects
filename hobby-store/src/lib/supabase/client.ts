import { createBrowserClient } from "@supabase/ssr";

function getCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const validUrl = url && (url.startsWith("http://") || url.startsWith("https://"))
    ? url
    : "https://placeholder-project.supabase.co";
  const validKey = key && key !== "your-supabase-anon-key" ? key : "dummy-anon-key-placeholder";
  return { url: validUrl, key: validKey };
}

export function createClient() {
  const { url, key } = getCredentials();
  return createBrowserClient(url, key);
}
