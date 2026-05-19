export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query param q' });

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return res.status(500).json({ error: 'Unsplash key not configured' });

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape&client_id=${key}`;
    const r = await fetch(url);
    const data = await r.json();
    const photo = data.results && data.results[0];
    if (!photo) return res.status(404).json({ error: 'No image found' });
    res.status(200).json({
      url: photo.urls.regular,
      thumb: photo.urls.small,
      alt: photo.alt_description || q,
      credit: photo.user.name,
      creditLink: photo.user.links.html + '?utm_source=kerv_platform&utm_medium=referral'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
