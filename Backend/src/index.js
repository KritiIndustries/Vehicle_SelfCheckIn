import { app } from './app.js'

import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
}) // Load environment variables from .env file

connectDB().then(() => app.listen(8000, () => console.log("Server Started in 8000")))
    .catch(err => console.log("Connection faailed", err))