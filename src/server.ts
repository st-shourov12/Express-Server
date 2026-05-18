import dotenv from "dotenv";

dotenv.config();

import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
// import config from "./config";

const app: Application = express();
const port = 5000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// &uselibpqcompat=true

// ssl: {
//         rejectUnauthorized: false // use true only if you have the CA cert
//     }

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // use true only if you have the CA cert
  },
});

const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(20),
                email VARCHAR(20) UNIQUE NOT NULL,
                password VARCHAR(20) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                age INT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()

            )
        `);
    console.log("database connected succcessfully");
    return;
  } catch (error) {
    console.log(error);
  }
};

initDB();

app.get("/", (req: Request, res: Response) => {
  // res.send("Express Server")
  res.status(200).json({
    message: "Express server",
    author: "Shourov",
  });
});

app.post("/api/user", async (req: Request, res: Response) => {
  const { name, email, password, is_active, age, created_at, updated_at } =
    req.body;

  try {
    const result = await pool.query(
      `
        INSERT INTO users(name, email, password, age) VALUES($1,$2,$3,$4)
        RETURNING *
    `,
      [name, email, password, age],
    );

    res.status(201).json({
      message: `User ${name} created successfully `,

      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

app.get("/api/user", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
            SELECT * FROM users
        `);
    res.status(200).json({
      success: true,
      message: "Users Retrive successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.get("/api/user/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT * FROM users WHERE id=$1
        `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not Found",
       
      });
    }
    res.status(200).json({
      success: true,
      message: "User Retrive successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
