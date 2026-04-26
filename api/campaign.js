// Mailchimp newsletter palette → Engage Colorado site palette.
// Applied at the proxy so Issue 1 + Issue 2 (and any prior campaigns)
// render in the new palette when displayed on engagecolorado.org/article.html.
// Inbox copies and the public mailchi.mp archive are untouched (immutable).
const PALETTE_MAP = {
  '#003275': '#1a3a52', // primary navy → dusk-mountain blue
  '#001C4F': '#0f2638', // deep navy → deeper dusk
  '#001030': '#0a1a26', // darkest navy
  '#FFD525': '#b86b34', // gold → terracotta
  '#C7453B': '#1a3a52', // flag red → drop, replace with navy (depoliticize)
  '#3A7D5C': '#2d4a3e', // green → forest green
  '#3D4F6B': '#1f2937', // slate blue 1 → slate
  '#5C6A7E': '#718096', // slate blue 2 → light slate
  '#8FA3C4': '#9ab0c2', // light slate blue → desaturated
  '#B0C4E0': '#c5d2dd', // lighter slate blue → desaturated
  '#EAEEF4': '#f0f4f8', // very light blue → neutral light
  '#DDD8CE': '#e5e7eb', // beige → neutral hairline
  '#F7F5F0': '#fafaf7', // cream → warm off-white
};

function recolor(html) {
  if (!html) return html;
  let out = html;
  for (const [from, to] of Object.entries(PALETTE_MAP)) {
    out = out.split(from).join(to);
    out = out.split(from.toLowerCase()).join(to.toLowerCase());
  }
  return out;
}

module.exports = async function handler(req, res) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  if (!apiKey) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({
      html: '',
      warning:
        'MAILCHIMP_API_KEY is not configured on this deployment. Add it in Vercel project settings.',
    });
  }

  const id = (req.query && req.query.id) || '';
  if (!id || !/^[a-f0-9]{1,64}$/i.test(id)) {
    return res.status(400).json({ html: '', error: 'invalid or missing id' });
  }

  const dc = apiKey.split('-').pop();
  if (!dc) {
    return res.status(500).json({
      html: '',
      error: 'MAILCHIMP_API_KEY is missing the datacenter suffix.',
    });
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/campaigns/${id}/content`;

  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `apikey ${apiKey}`,
        'User-Agent': 'engagecolorado.vercel.app (campaign content)',
      },
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(200).json({
        html: '',
        warning: `Mailchimp API returned ${r.status}. ${text.slice(0, 240)}`,
      });
    }

    const data = await r.json();
    // Short cache during active design iteration — bump back up (e.g.
    // s-maxage=600, stale-while-revalidate=3600) once the palette stabilizes.
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    return res.status(200).json({
      html: recolor(data.html || ''),
      plain_text: data.plain_text || '',
    });
  } catch (err) {
    return res.status(200).json({
      html: '',
      error: String((err && err.message) || err),
    });
  }
};
