import express, { type Application, type Request, type Response } from "express";
import {Pool} from "pg"
import config from "./config";
const app: Application = express();
const port = 5000;

app.use(express.json());
app.use(express.text())
app.use(express.urlencoded({extended: true}));


const pool = new Pool({
    connectionString : `${config.connectionString}`
})

app.get("/", (req : Request, res : Response)=> {
    // res.send("Express Server")
    res.status(200).json({
        message : "Express server",
        "author" : "Shourov"
    })
})

app.post("/", async(req : Request, res : Response) =>{
    // console.log(req.body);
    // const body = req.body ;
    const {name, email} = req.body ;
    res.status(200).json({
        message : "Data Created",
        data : {
            name, email
        }
    })
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})