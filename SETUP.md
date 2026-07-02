# Setup: connecting your Google Sheet

This site no longer depends on Genspark's Table API. Instead, both the
quote tool and the contact form send leads straight into a Google Sheet
you control. Takes about 5 minutes.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it something like "Mean Green Window Clean — Leads."
3. You don't need to add any columns yourself — the script creates a "Leads" tab with headers automatically the first time it runs.

## 2. Add the Apps Script

1. In your new Sheet, go to **Extensions > Apps Script**.
2. Delete any placeholder code in the editor.
3. Open `google-apps-script.gs` from this project, copy all of it, and paste it into the Apps Script editor.
4. Click the save icon (or Ctrl/Cmd+S).

## 3. Deploy it as a web app

1. In the Apps Script editor, click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Google will ask you to authorize the script — click through the permission prompts (you'll see an "unverified app" warning since this is your own personal script; click **Advanced > Go to [project name] (unsafe)** to proceed. This is expected for scripts you write yourself.)
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Connect the site to your Sheet

1. Open `js/main.js`.
2. Find this line near the top:
   ```js
   const GOOGLE_SHEETS_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace the placeholder with the Web app URL you copied.
4. Save the file.

## 5. Test it

1. Open `index.html` in a browser (or host it, see below).
2. Fill out the quote tool or contact form and submit.
3. Check your Google Sheet — a new row should appear on the "Leads" tab within a few seconds.

If nothing shows up, double check the deployment's "Who has access" is set to **Anyone**, not "Anyone with a Google account" — the site needs to post to it without a login.

## 6. Hosting

This is a plain static site (HTML/CSS/JS, no build step), so it runs anywhere that serves static files:

- **Cloudflare Pages** — drag the whole folder into a new Pages project, or connect it to a GitHub repo.
- **Vercel / Netlify** — same idea, no build command needed since there's no framework.
- Even opening `index.html` directly in a browser works for testing, though you'll want real hosting before sharing the link with customers.

## Re-deploying after script changes

If you ever edit `google-apps-script.gs` again, you need to create a **new deployment** (or deploy a new version of the existing one) for the changes to take effect — saving the script alone doesn't update the live web app.

---

## SEO checklist

The site now includes:
- A tightened title tag and meta description targeting Calgary window cleaning
- Open Graph and Twitter Card tags (for link previews on social/Slack/iMessage)
- LocalBusiness structured data (`JSON-LD`) so Google can understand this as a real local business — name, service area, hours, price range
- `robots.txt` and `sitemap.xml`
- `width`/`height` on every image plus `loading="lazy"` on below-the-fold images, and `fetchpriority="high"` on the hero image, to help page speed (a ranking factor)

**Before this goes live, swap these placeholders for the real thing:**

1. **Domain** — everything above assumes `https://meangreenwindowclean.com/`. Search-and-replace that domain across `index.html`, `robots.txt`, and `sitemap.xml` once you know your real domain.
2. **Phone & email** — still `(555) 123-4567` / `hello@meangreenwindowclean.com` throughout the site and in the structured data block in `index.html`.
3. **Address** — the structured data currently only has city-level Calgary coordinates, not a street address. If you have a fixed business address (even a home office you're comfortable listing), add it to the `address` block in the `<script type="application/ld+json">` section for stronger local search results. If not, city-level is fine — plenty of service-area businesses skip a street address.
4. **Social links** — the `sameAs` array in the structured data is empty. Add URLs for any social profiles (Instagram, Facebook, etc.) once they exist.
5. **Once live:** submit `sitemap.xml` to [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters) so both engines know to crawl it.
6. **Replace review names** — the testimonials are placeholder names. Swap in real customer reviews once you have them; genuine reviews (and eventually a Google Business Profile with real reviews) do far more for local SEO than anything on this list.

