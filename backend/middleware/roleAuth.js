module.exports = function (requiredRole) {
  return (req, res, next) => {
    const role = req.headers["x-role"]; // coming from frontend

    if (!role) {
      return res.status(401).json({ message: "Role missing" });
    }

    if (requiredRole === "superadmin" && role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
