module.exports = (req, res, next) => {
  const role = req.headers["x-role"];

  if (role !== "superadmin") {
    return res.status(403).json({
      message: "Access denied. Super Admin only.",
    });
  }

  next();
};
