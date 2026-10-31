export const statuses=["Wishlist","Applied","Interview","Offer","Rejected"];
export function validateCredentials(data,register=false){
 if(!data||typeof data!=="object"||Array.isArray(data))return "Invalid payload";
 if(typeof data.email!=="string"||!/^\S+@\S+\.\S+$/.test(data.email.trim())||data.email.length>254)return "Enter a valid email";
 if(typeof data.password!=="string"||data.password.length<8||data.password.length>128)return "Password must be 8–128 characters";
 if(register&&(typeof data.name!=="string"||data.name.trim().length<2||data.name.trim().length>90))return "Name must be 2–90 characters";
 return null;
}
export function validateApplication(data,partial=false){
 if(!data||typeof data!=="object"||Array.isArray(data))return "Invalid payload";
 const allowed=["company","role","status","url","notes","applied_at"];
 if(!partial&&!["company","role"].every(k=>Object.hasOwn(data,k)))return "Company and role are required";
 if(Object.keys(data).length===0||Object.keys(data).some(k=>!allowed.includes(k)))return "Unknown or empty fields";
 for(const field of ["company","role"]){if(!partial||Object.hasOwn(data,field)){const x=data[field];if(typeof x!=="string"||!x.trim()||x.trim().length>120)return field+" must be 1–120 characters";}}
 if(Object.hasOwn(data,"status")&&!statuses.includes(data.status))return "Invalid status";
 if(Object.hasOwn(data,"url")&&data.url!==null&&data.url!==""){
  try{const u=new URL(data.url);if(!["https:","http:"].includes(u.protocol))return "URL must be http(s)";}catch{return "Invalid URL";}
 }
 if(Object.hasOwn(data,"notes")&&(typeof data.notes!=="string"||data.notes.length>1000))return "Notes exceed 1000 characters";
 if(Object.hasOwn(data,"applied_at")){
  if(typeof data.applied_at!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(data.applied_at)||Number.isNaN(Date.parse(data.applied_at))||new Date(data.applied_at).toISOString().slice(0,10)!==data.applied_at)return "Date must use YYYY-MM-DD";
 }
 return null;
}
