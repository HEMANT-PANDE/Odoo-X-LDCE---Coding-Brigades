// Wire with router.param(name, validateIntParam(name)) so a non-numeric
// :id/:tripId/etc. 400s once per router instead of crashing every handler
// that does Number(req.params.x) on it.
function validateIntParam(paramName) {
  return (req, res, next, value) => {
    if (!/^\d+$/.test(value)) return res.status(400).json({ error: `Invalid ${paramName}` });
    next();
  };
}

module.exports = { validateIntParam };
