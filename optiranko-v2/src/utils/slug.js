const generateSlug = (text) => {
  const base = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
};

module.exports = { generateSlug };