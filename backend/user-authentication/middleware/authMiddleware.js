import jwt from "jsonwebtoken";

const SECRET_KEY = "my_evil_super_secret_key";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token expired" });
    req.user = decoded;
    next();
  });
};
