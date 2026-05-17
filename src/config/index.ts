import dotenv from "dotenv"
import path from "path"

dotenv.config({path: path.resolve(process.cwd(), '.env')})

const config = {
    connectionString : process.env.CONNECTION_STRING,
}

export default config;