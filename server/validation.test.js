import test from "node:test";import assert from "node:assert/strict";
import {validateCredentials,validateApplication} from "./validation.js";
test("user signup validates email and password",()=>{
 assert.equal(validateCredentials({name:"Jane",email:"jane@example.com",password:"securepassword"},true),null);
 assert.match(validateCredentials({name:"Jane",email:"invalid",password:"securepassword"},true),/email/);
});
test("app records require company and role",()=>{
 assert.match(validateApplication({company:"X"}),/required/);
 assert.equal(validateApplication({company:"Acme",role:"Developer",status:"Applied"}),null);
});
test("rejects invalid status and javascript URLs",()=>{
 assert.equal(validateApplication({status:"Hidden"},true),"Invalid status");
 assert.equal(validateApplication({url:"javascript:alert(1)"},true),"URL must be http(s)");
});
test("allows status-only patch, rejects unknown fields",()=>{
 assert.equal(validateApplication({status:"Interview"},true),null);
 assert.match(validateApplication({admin:true},true),/Unknown/);
});
