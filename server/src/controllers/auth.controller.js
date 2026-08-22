import { registerUser } from "../services/auth.service.js";
import { loginUser } from "../services/auth.service.js";

export const register = async (req, res) => {

  try {

    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

};


export const login = async (req, res) => {

  try {

    const data = await loginUser(req.body);

    return res.status(200).json({

      success: true,

      message: "Login successful",

      data

    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message: error.message

    });

  }

};


export const profile = async (req, res) => {

    return res.status(200).json({

        success: true,

        message: "Profile fetched successfully",

        data: req.user

    });

};