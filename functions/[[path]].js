// Pages Function: স্থির ফাইল থাকলে সেটাই দেবে।
// না থাকলে (যেমন /jobs, /prep, /jobs/<slug>) SPA-এর index.html দেবে।
export async function onRequest(context) {
  const { request, env } = context;

  // ১. স্থির ফাইল বা অ্যাসেট
  const asset = await env.ASSETS.fetch(request);
  if (asset.status !== 404) return asset;

  // ২. SPA fallback: root-এর index.html (সরাসরি /index.html ব্যবহার করলে 308 আসে)
  const url = new URL(request.url);
  const shell = await env.ASSETS.fetch(new URL("/", url.origin));
  return new Response(shell.body, {
    status: 200,
    headers: shell.headers,
  });
}
