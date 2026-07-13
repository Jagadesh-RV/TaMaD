import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import User from "../models/User";

// NOTE:
// This repo's backend currently runs from `backend/index.js` / `backend/app.js` (plain JS).
// These TS controller files are for the upgraded TS backend structure.

export const register = async (req: any, res: any) => {
  try {
    const { name, email, mobile, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({
        message: "Mobile already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      isMobileVerified: true,
    });

    const token = generateToken(user._id.toString());

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Registration Failed",
    });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id.toString());

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Login Failed",
    });
  }
};

