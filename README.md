# Mean Green Window Clean 🪟💚

A modern, conversion-focused marketing website for a window cleaning side hustle, featuring a **free instant AI-style quote calculator**, competitive pricing information, and lead capture — all built as a static site.

> Brand name suggestion: **"Mean Green Window Clean"** — mean about grime, green about clean. Rhymes, memorable, and hints at eco-friendly service. Easy to rename later if you land on something else (see "Rebranding" section below).

---

## 1. Completed Features

- **Responsive marketing site** (mobile-first) built with Tailwind CSS (CDN), Font Awesome icons, and Google Fonts (Poppins + Inter).
- **Sticky header** with nav links, phone number, and CTA button; mobile hamburger menu.
- **Hero section** with strong value proposition, trust badges, and dual CTAs.
- **Services section**: Residential, Commercial, and Add-on services (screens, tracks, gutters, solar panels) with imagery.
- **Pricing/Why Us section**: transparent starting-rate cards + a "Price-Match Promise" panel to reinforce "competitive prices."
- **Free AI Instant Quote Tool** (`#quote-section`):
  - 4-step guided form (Property → Windows → Extras → Contact info) with progress indicator.
  - Client-side "AI-style" pricing engine (`calculateEstimate()` in `js/main.js`) that factors in:
    - Property type (residential vs. commercial base rate)
    - Number of windows/panes (slider input)
    - Number of stories (multiplier for access difficulty)
    - Service type (interior / exterior / both)
    - Recurring frequency discounts (monthly/quarterly/bi-annual)
    - Add-ons (screens, tracks & sills, gutters, solar panels)
  - Generates an instant estimated price **range** with a breakdown summary.
  - Submits the lead (contact info + quote parameters + estimate) to the `leads` table via the Table API.
- **Testimonials/reviews section.**
- **Contact form** (separate from the quote tool) that also saves to the `leads` table.
- **Sticky mobile "Get Free Instant Quote" CTA** for small screens.
- **Footer** with quick links, services list, and contact info.
- Basic on-page SEO (title, meta description) and semantic HTML throughout (`header`, `nav`, `main`, `section`, `article`, `footer`).

## 2. Site Structure / Entry Points

| Path | Description |
|---|---|
| `index.html` | Single-page site. In-page anchors: `#hero-section`, `#services-section`, `#pricing-section`, `#quote-section`, `#reviews-section`, `#contact-section`. |
| `css/style.css` | Custom styles supplementing Tailwind (quote tool option cards, progress stepper, form inputs, animations). |
| `js/main.js` | Mobile menu logic, multi-step quote tool logic + pricing engine, Table API integration for both the quote tool and contact form. |
| `images/` | Logo (`logo.png`) and stock photography used across hero/services sections. |

### Table API Endpoints Used
- `POST` to your deployed Google Apps Script web app URL — called by both the AI Quote Tool and the Contact Form to store new leads as rows in a Google Sheet. See `SETUP.md` for how to connect this.

## 3. Data Model — `leads` table

| Field | Type | Notes |
|---|---|---|
| `id` | text | Auto-managed record ID |
| `name` | text | Customer name |
| `email` | text | Customer email |
| `phone` | text | Customer phone |
| `address` | text | Property address/area |
| `property_type` | text | "Residential" or "Commercial" |
| `num_windows` | number | Approx. window/pane count |
| `stories` | number | Number of stories/floors |
| `service_type` | text | "Exterior Only" / "Interior Only" / "Interior & Exterior" |
| `frequency` | text | "One-time" / "Monthly" / "Quarterly" / "Bi-Annual" |
| `extras` | array | Selected add-ons (Screens, Tracks & Sills, Gutter Cleaning, Solar Panels) |
| `estimated_low` | number | AI-estimated low price (USD) |
| `estimated_high` | number | AI-estimated high price (USD) |
| `message` | rich_text | Freeform notes from customer |
| `status` | text | Lead status: New / Contacted / Scheduled / Completed / Closed |
| `source` | text | "AI Quote Tool" or "Contact Form" |

This data is stored via the built-in RESTful Table API (no external database setup required).

## 4. Important Notes on the "AI" Quote Tool

Per this platform's static-site constraints, **the quote engine runs entirely client-side in JavaScript** — it does not call a real LLM/AI API (which would require a paid, authenticated backend service outside the scope of a static site). Instead, it uses a transparent, rules-based pricing formula (window count, stories, service type, frequency discounts, add-ons) presented to the customer as an "instant smart estimate." This delivers the same user experience (immediate, personalized pricing with zero human involvement) while remaining fully static and free to run.

If in the future you want a *true* generative-AI-backed quote (e.g., customers upload a photo of their house and AI counts windows), that would require a server-side/authenticated AI API integration, which is outside this static website's capabilities — happy to advise on options if you pursue that later.

## 5. Features Not Yet Implemented

- Real photo-upload-based window counting (would require a backend AI vision API).
- Online payment/deposit collection at booking.
- Automated email/SMS confirmation to the customer after a quote is submitted (would require an email/SMS service integration — e.g., a Zapier webhook or similar, since this is a static site with no server-side email sending).
- An admin dashboard to view/manage leads (currently leads can be viewed via the Table API directly or you can request a simple internal dashboard page).
- Real business info (phone number, email, service area, and photos are currently placeholders — update before launch).
- Google Maps / service-area visual.
- Blog or SEO content pages.

## 6. Recommended Next Steps

1. **Swap placeholder contact info** — replace `(555) 123-4567`, `hello@meangreenwindowclean.com`, and "Greater Metro Area" with your real phone, email, and service area.
2. **Finalize your brand name** — "Mean Green Window Clean" is used throughout `index.html`, the logo, and page title. If you pick a different name, search-and-replace it across `index.html` and regenerate the logo.
3. **Add real before/after photos** of your own completed jobs once you have them — this builds trust more than stock photography.
4. **Connect a lead notification** — consider a service like Zapier/Make with a webhook that watches the `leads` table (via polling or a connected form service) to text/email you immediately when a new lead comes in.
5. **Build a simple internal leads dashboard** (optional) — a password-free, unlisted internal page that reads from the `leads` table so you can track/manage quote requests and update their `status`.
6. **Review and adjust pricing formula** in `calculateEstimate()` (in `js/main.js`) to match your real, local market rates.
7. **When ready to go live**, deploy the site to a static host like Cloudflare Pages, Vercel, or Netlify — see `SETUP.md` for details.

## 7. Tech Stack

- HTML5 (semantic markup)
- Tailwind CSS (via CDN)
- Vanilla JavaScript (no framework)
- Font Awesome 6 (icons)
- Google Fonts: Poppins (headings) + Inter (body)
- Google Apps Script + Google Sheets for lead storage (see `SETUP.md`)

## 8. Project Goal

Give a solo window-cleaning side hustle a professional, trustworthy online presence that:
- Builds instant credibility with modern design and social proof.
- Removes friction in getting a price by offering an **instant, free, AI-styled quote** — no phone tag required.
- Emphasizes **competitive/transparent pricing** to win price-sensitive local customers.
- Captures every lead automatically so no inquiry is missed.
