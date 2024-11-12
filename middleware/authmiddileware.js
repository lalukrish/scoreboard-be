const jwt = require("jsonwebtoken");

const authenicatedUser = (req, res, next) => {
  const authHead = req.header("Authorization");

  if (!authHead) {
    return res.status(401).json({ error: "Access denied, token missing!" });
  }

  const token = authHead.replace("Bearer ", "");
  console.log("object", token);
  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing!" });
  }

  try {
    const decoded = jwt.verify(
      token,
      "sdfsdf2SD34NZXRasdr34nsdrn3sDsdfasrWWAr"
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authenicatedUser;
