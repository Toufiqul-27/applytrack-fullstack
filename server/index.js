import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import {statuses,validateApplication,validateCredentials} from "./validation.js";

const {Pool}=pg;
if(!process.env.DATABASE_URL)throw new Error("Set DATABASE_URL in server/.env");
const secret=process.env.JWT_SECRET;
if(!secret||secret.length<32)throw new Error("JWT_SECRET must be at least 32 characters");
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:10});
const app=express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_ORIGIN||"http://localhost:5173"}));
app.use(express.json({limit:"20kb"}));
app.use("/api/auth",rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:"draft-7",legacyHeaders:false}));
const route=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
function auth(req,res,next){
 const header=req.get("authorization")||"";
 if(!header.startsWith("Bearer ")){res.status(401).json({error:"Sign in to continue"});return;}
 try{const data=jwt.verify(header.slice(7),secret);if(typeof data.sub!=="string")throw new Error("Invalid session");req.userId=data.sub;next();}
 catch{res.status(401).json({error:"Session expired or invalid"});}
}
function tokenFor(id){return jwt.sign({},secret,{subject:id,expiresIn:"12h"});}
function validId(req,res){const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1){res.status(400).json({error:"Invalid ID"});return null;}return id;}
app.get("/api/health",(_req,res)=>res.json({status:"ok",service:"applytrack-api"}));
app.post("/api/auth/register",route(async(req,res)=>{
 const error=validateCredentials(req.body,true);if(error){res.status(400).json({error});return;}
 const {name,password}=req.body,email=req.body.email.toLowerCase().trim();
 const hash=await bcrypt.hash(password,12);
 try{const rows=await pool.query("INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email",[name.trim(),email,hash]);const user=rows.rows[0];res.status(201).json({token:tokenFor(user.id),user});}
 catch(e){if(e.code==="23505"){res.status(409).json({error:"Email already registered"});return;}throw e;}
}));
app.post("/api/auth/login",route(async(req,res)=>{
 const error=validateCredentials(req.body);if(error){res.status(400).json({error});return;}
 const {rows}=await pool.query("SELECT id,name,email,password_hash FROM users WHERE email=$1",[req.body.email.toLowerCase().trim()]);const user=rows[0];
 if(!user||!(await bcrypt.compare(req.body.password,user.password_hash))){res.status(401).json({error:"Invalid email or password"});return;}
 res.json({token:tokenFor(user.id),user:{id:user.id,name:user.name,email:user.email}});
}));
app.get("/api/applications",auth,route(async(req,res)=>{
 const {rows}=await pool.query("SELECT id,company,role,status,url,notes,TO_CHAR(applied_at,'YYYY-MM-DD') AS applied_at,updated_at FROM applications WHERE user_id=$1 ORDER BY updated_at DESC, id DESC LIMIT 200",[req.userId]);res.json(rows);
}));
app.post("/api/applications",auth,route(async(req,res)=>{
 const err=validateApplication(req.body);if(err){res.status(400).json({error:err});return;}
 const x=req.body;
 const {rows}=await pool.query(`INSERT INTO applications(user_id,company,role,status,url,notes,applied_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,company,role,status,url,notes,TO_CHAR(applied_at,'YYYY-MM-DD') AS applied_at,updated_at`,[req.userId,x.company.trim(),x.role.trim(),x.status||"Applied",x.url||null,x.notes||"",x.applied_at||new Date().toISOString().slice(0,10)]);
 res.status(201).json(rows[0]);
}));
app.patch("/api/applications/:id",auth,route(async(req,res)=>{
 const id=validId(req,res);if(id===null)return;
 const err=validateApplication(req.body,true);if(err){res.status(400).json({error:err});return;}
 const allowed=["company","role","status","url","notes","applied_at"];
 const entries=Object.entries(req.body).filter(([k])=>allowed.includes(k));
 const values=entries.map(([key,value])=>["company","role"].includes(key)?value.trim():key==="url"?(value||null):value);
 const fields=entries.map(([k],i)=>`${k}=$${i+3}`).join(",");
 const {rows}=await pool.query(`UPDATE applications SET ${fields},updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING id,company,role,status,url,notes,TO_CHAR(applied_at,'YYYY-MM-DD') AS applied_at,updated_at`,[id,req.userId,...values]);
 if(!rows.length){res.status(404).json({error:"Application not found"});return;}res.json(rows[0]);
}));
app.delete("/api/applications/:id",auth,route(async(req,res)=>{
 const id=validId(req,res);if(id===null)return;
 const {rowCount}=await pool.query("DELETE FROM applications WHERE id=$1 AND user_id=$2",[id,req.userId]);
 if(!rowCount){res.status(404).json({error:"Application not found"});return;}res.status(204).end();
}));
app.use((_req,res)=>res.status(404).json({error:"Not found"}));
app.use((err,req,res,next)=>{console.error(err);if(err instanceof SyntaxError&&"body" in err){res.status(400).json({error:"Invalid JSON"});return;}res.status(500).json({error:"Server error"});});
const port=Number(process.env.PORT)||4001;
const httpServer=app.listen(port,()=>console.log(`ApplyTrack API: http://localhost:${port}`));
async function shutdown(){httpServer.close();await pool.end();}
for(const signal of ["SIGTERM","SIGINT"])process.on(signal,()=>{shutdown().then(()=>process.exit(0));});
