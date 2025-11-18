/* eslint-disable no-undef */
import express from 'express';
import dotenv from 'dotenv';
import mainRouter from './src/routes/index.js';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

app.use('/', mainRouter);

console.log(process.env.GOOGLE_EMAIL, process.env.EMAIL_PASSWORD);

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT}-portda ishlayapti`);
});
