import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"
dotenv.config({
    "path":"./.env"
})

connectDB()
.then(()=>{
        const port=process.env.PORT ||5000
        app.listen(port,()=>{
            console.log(`erver is running on port ${port}`)
        })
})
.catch((error)=>{
    console.log("Error connecting to the database",error)
})