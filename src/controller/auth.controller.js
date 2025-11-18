/* eslint-disable no-undef */
import db from '../db/knex.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import { generateAccessToken, generateRefreshToken } from '../helpers/jwt.js';
import { sendVerificationCode } from '../services/email.service.js';

export const signUp = async (req, res, next) => {
  try {

    const { email, username, password, role } = req.body;

    const existing = await db('users')
      .where('username', username)
      .orWhere('email', email)
      .select('*');

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: 'Username yoki Email allaqachon mavjud!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await db.transaction(async (trx) => {
      const [newUser] = await trx('users')
        .insert({
          email,
          username,
          password: hashedPassword,
          role,
          otp_code: otp,
          otp_expires: expires,
        })
        .returning(['id', 'username', 'email', 'role', 'status']);

      await sendVerificationCode(email, otp);

      res.status(201).json({
        message: 'Muvafaqqiyatli yaratildi. OTP kod sizning emailingizga yuborildi.',
        success:true,
        data: newUser,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {

    const { email, otp } = req.body;

    const user = await db('users').where({ email, otp_code: otp }).first();

    if (!user) return res.status(400).json({ message: "OTP noto'g'ri!" });
    if (new Date() > user.otp_expires)
      return res.status(400).json({ message: 'OTP muddati tugagan!' });

    await db('users').where({ email }).update({
      status: 'active',
      otp_code: null,
      otp_expires: null,
    });

    res.json({ message: 'Email muvaffaqiyatli tasdiqlandi!' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await db('users')
      .where('email', email)
      .orWhere('username', email)
      .first();

    if (!user) {
      return res.status(400).json({ message: 'User topilmadi!' });
    }

    if (user.status !== 'active') {
      return res.status(400).json({ message: 'Email tasdiqlanmagan!' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Parol noto'g'ri!" });
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: 'Login muvaffaqiyatli!',
        success:true,
        data: { accessToken, refreshToken },
      });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await db('users')
      .select(
        'id',
        'email',
        'username',
        'role',
        'status',
        'created_at',
        'updated_at'
      )
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User topilmadi!' });
    }

    res.status(200).json({
      message: 'Your profile',
      success:true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      message: 'Logout successful',
      success:true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: 'Token refreshed',
        success:true,
        data: { accessToken, refreshToken },
      });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
