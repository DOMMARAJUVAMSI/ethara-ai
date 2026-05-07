import jwt from "jsonwebtoken";

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export default generateToken;
