export type Status="Wishlist"|"Applied"|"Interview"|"Offer"|"Rejected";
export const statuses:Status[]=["Wishlist","Applied","Interview","Offer","Rejected"];
export interface Application {id:number;company:string;role:string;status:Status;url:string|null;notes:string;applied_at:string;updated_at:string}
export type Draft=Omit<Application,"id"|"updated_at">;
export const newDraft=():Draft=>({company:"",role:"",status:"Applied",url:"",notes:"",applied_at:new Date().toLocaleDateString("en-CA")});
export function statistics(rows:Application[]){return {total:rows.length,interviews:rows.filter(r=>r.status==="Interview").length,offers:rows.filter(r=>r.status==="Offer").length,applied:rows.filter(r=>r.status==="Applied").length};}
export function findApps(rows:Application[],q:string,status:string){const term=q.toLowerCase().trim();return rows.filter(r=>(status==="All"||r.status===status)&&(r.company.toLowerCase().includes(term)||r.role.toLowerCase().includes(term)));}
