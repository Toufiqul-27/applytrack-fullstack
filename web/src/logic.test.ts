import {describe,expect,it} from "vitest";import {statistics,findApps,type Application} from "./logic";
const row:Application={id:1,company:"Acme",role:"Frontend Developer",status:"Applied",url:null,notes:"",applied_at:"2026-01-01",updated_at:"2026-01-01"};
describe("application dashboard",()=>{it("counts statuses",()=>{expect(statistics([row,{...row,id:2,status:"Interview"}])).toEqual({total:2,applied:1,interviews:1,offers:0});});it("searches by company and filters status",()=>{expect(findApps([row],"ACME","All")).toHaveLength(1);expect(findApps([row],"","Offer")).toHaveLength(0);});});
