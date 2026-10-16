const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (!admin || !(await admin.matchPassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  res.json({
    success: true,
    token: generateToken(admin._id),
    admin: { id: admin._id, email: admin.email },
  });
};
