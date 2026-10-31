import type{Application,Draft} from "./logic";
export type User={id:string;name:string;email:string};
export type Session={token:string;user:User};
const base=(import.meta.env.VITE_API_BASE_URL??"").replace(/\/$/,"");
export async function request<T>(path:string,method="GET",token?:string,payload?:unknown):Promise<T>{
 let response:Response;
 try{response=await fetch(base+"/api"+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},...(payload===undefined?{}:{body:JSON.stringify(payload)})});}
 catch{throw new Error("Could not connect to API. Is the backend running?");}
 if(response.status===204)return undefined as T;
 const data=await response.json().catch(()=>({error:"Invalid server response"}));
 if(!response.ok)throw new Error(data.error||"Request failed");
 return data as T;
}
export const getApplications=(token:string)=>request<Application[]>("/applications","GET",token);
export const saveApplication=(token:string,data:Draft,id?:number)=>request<Application>("/applications"+(id?"/"+id:""),id?"PATCH":"POST",token,data);
export const deleteApplication=(token:string,id:number)=>request<void>("/applications/"+id,"DELETE",token);
