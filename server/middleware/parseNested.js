// Middleware to transform flat keys like 'location.city' and 'amenities[0]'
// into nested objects/arrays on req.body. Useful for multipart/form-data where
// nested objects aren't auto-parsed.

function setNested(obj, path, value) {
  // Tokenize: matches dot segments and bracket indices: foo.bar[0].baz
  const tokens = [];
  const re = /([^.\[\]]+)|(\[(\d+)\])/g;
  let match;
  while ((match = re.exec(path))) {
    if (match[1]) tokens.push(match[1]);
    else if (match[3]) tokens.push(Number(match[3]));
  }

  let curr = obj;
  for (let i = 0; i < tokens.length; i++) {
    const key = tokens[i];
    const isLast = i === tokens.length - 1;

    if (isLast) {
      curr[key] = value;
      return;
    }

    const nextKey = tokens[i + 1];
    if (typeof nextKey === 'number') {
      if (!Array.isArray(curr[key])) curr[key] = [];
    } else {
      if (typeof curr[key] !== 'object' || curr[key] === null) curr[key] = {};
    }
    curr = curr[key];
  }
}

module.exports = function parseNested(req, res, next) {
  if (!req.body || typeof req.body !== 'object') return next();

  const flat = req.body;
  const nested = {};

  // Copy over existing non-conflicting simple keys while we reconstruct known patterns
  for (const [k, v] of Object.entries(flat)) {
    if (k.includes('.') || /\[\d+\]/.test(k)) {
      setNested(nested, k, v);
    } else {
      nested[k] = v;
    }
  }

  req.body = nested;
  next();
};