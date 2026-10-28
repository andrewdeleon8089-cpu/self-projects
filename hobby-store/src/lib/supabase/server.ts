import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const validUrl = url && (url.startsWith("http://") || url.startsWith("https://"))
    ? url
    : "https://placeholder-project.supabase.co";
  const validKey = key && key !== "your-supabase-anon-key" ? key : "dummy-anon-key-placeholder";
  return { url: validUrl, key: validKey };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getCredentials();

  return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
