import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (userData) => {

  const { fullName, mobile, email, password } = userData;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { mobile },
        ...(email ? [{ email }] : [])
      ]
    }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      mobile,
      email: email || null,
      password: hashedPassword
    }
  });

  return {
    id: user.id,
    fullName: user.fullName,
    mobile: user.mobile,
    email: user.email
  };
};


export const loginUser = async ({ mobile, password }) => {

  const user = await prisma.user.findUnique({
    where: {
      mobile
    }
  });

  if (!user) {
    throw new Error("Invalid mobile or password");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid mobile or password");
  }

  const token = generateToken(user.id);

  return {

    token,

    user: {
      id: user.id,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email
    }

  };

};