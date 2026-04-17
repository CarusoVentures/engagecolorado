const MAILCHIMP_RSS =
  'https://engageboulder.us18.campaign-archive.com/feed?u=3bfb0e6816958c8055d40bf48&id=3baceb2cd8';

module.exports = async function handler(req, res) {
  try {
    const r = await fetch(MAILCHIMP_RSS, {
      headers: { 'User-Agent': 'engagecolorado.vercel.app (newsletter fetcher)' },
    });

    if (!r.ok) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).json({
        campaigns: [],
        warning: `Mailchimp archive feed returned ${r.status}. Verify the audience's public archive is enabled.`,
      });
    }

    const xml = await r.text();
    const campaigns = parseRssItems(xml);

    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    res.status(200).json({ campaigns });
  } catch (err) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).json({ campaigns: [], error: String(err && err.message || err) });
  }
};

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: readTag(block, 'title'),
      link: readTag(block, 'link'),
      pubDate: readTag(block, 'pubDate'),
      description: readTag(block, 'description'),
    });
  }
  return items;
}

function readTag(block, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  if (!m) return '';
  return m[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
}
