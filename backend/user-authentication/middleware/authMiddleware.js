import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  jwt.verify(token, "SECRET_KEY_HERE", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token expired" });
    req.user = decoded;
    next();
  });
};

export default authMiddleware;
