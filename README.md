# Angelle's Affordable Air Conditioning and Heating

Static one-page site for Angelle's, Lafayette LA. No build step, no framework,
no dependencies — `index.html`, `style.css`, `script.js` and four images.

```
index.html      markup, including the Netlify booking form
style.css       all styling (palette as CSS custom properties at the top)
script.js       quote calculator + booking form submit handler
netlify.toml    publish the repo root, no build command
images/         photos (currently stock placeholders)
```

Preview locally with any static server:

```bash
python3 -m http.server 8000
```

## Before this goes live

| # | Item | Where |
|---|------|-------|
| 1 | ~~Phone number~~ — done, `(337) 236-1738` is live | `index.html` ×6, `script.js` ×1 |
| 2 | Street address and Louisiana mechanical license number | `index.html`, footer |
| 3 | Google Business Profile and Facebook URLs (`href="#"`) | `index.html`, footer |
| 4 | Photos are stock — swap for Randy's real truck/crew and rewrite the alt text | `images/` |
| 5 | Confirm the "22 years" / "since 2003" figures with Randy | `index.html` ×4 |

Replace the phone number everywhere in one pass (swap in the new number
on both sides):

```bash
grep -rl '236-1738\|+13372361738' . --exclude-dir=.git | xargs sed -i '' \
  -e 's/(337) 236-1738/(337) 555-0199/g' -e 's/+13372361738/+13375550199/g'
```

## Netlify Forms

The booking form is real static HTML with `data-netlify="true"`, so Netlify's
build-time parser finds it in the deployed `index.html`. No hidden duplicate
form is required — that workaround exists only for JavaScript-rendered forms
(React/Vue), which this is not.

`script.js` intercepts the submit and POSTs the same payload via `fetch` so the
visitor stays on the page. If JavaScript fails or is unavailable, the form falls
back to a native POST and Netlify shows its own confirmation page.

Spam is filtered with a honeypot: `data-netlify-honeypot="bot-field"` plus a
hidden `bot-field` input. People never see it and it is skipped by keyboard and
screen readers; bots fill it in and Netlify silently drops those submissions.
It is not one of the five real fields and never appears in a submission.

**Form detection is off by default on new Netlify sites.** After the first
deploy: Site configuration → Forms → enable form detection, then trigger a new
deploy. Submissions land under the form name `booking`.

Set up notifications at Forms → Settings → Form notifications so new leads reach
Randy's phone or inbox — the dashboard alone is not a lead workflow.
