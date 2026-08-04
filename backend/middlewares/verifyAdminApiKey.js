// Gates the internal admin API the master panel calls for nomad user data.
// A shared secret (not a per-user JWT) since these requests come from the
// master panel's backend, not a signed-in Nomad app user.
export const verifyAdminApiKey = (req, res, next) => {
  const providedKey = req.headers["x-admin-api-key"];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey || providedKey !== expectedKey) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};
