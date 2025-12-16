import jwt from "jsonwebtoken";

const hrAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 必须是 HR 才能通过
    if (decoded.role !== "hr") {
      return res.status(403).json({ msg: "Access denied: HR only" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

export default hrAuth;