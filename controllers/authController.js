const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/userModel');

const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findUserByUsername(username);
    if (existingUser) return res.status(400).json({ message: "Username already exists!" });

    await User.createUser({ username, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Error registering user!" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    const accessToken = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: "7d" });
    
    await User.updateRefreshToken(user.id, refreshToken);

    // ส่ง Refresh Token ผ่าน HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in!" });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken; // อ่านค่าจาก Cookie
  if (!token) return res.status(403).json({ message: "Refresh Token is required!" });

  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await User.findUserById(decoded.id);

    if (!user || !user.refreshToken) return res.status(403).json({ message: "Invalid Refresh Token!" });

    const isValidToken = await bcrypt.compare(token, user.refreshToken);
    if (!isValidToken) return res.status(403).json({ message: "Invalid Refresh Token!" });

    const newAccessToken = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired Refresh Token!" });
  }
};

const logout = async (req, res) => {
  try {
    await User.updateRefreshToken(req.userId, null); 
    res.clearCookie('refreshToken'); // ลบ Cookie ทิ้ง
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out" });
  }
};

module.exports = { register, login, refreshToken, logout };