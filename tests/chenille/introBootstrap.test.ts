import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { INTRO_BOOTSTRAP, INTRO_ATTRIBUTE, INTRO_SESSION_KEY } from "../../lib/chenille/introBootstrap";
function boot(pathname:string,seen=false,reduced=false,brokenStorage=false){
  const attrs=new Map<string,string>();
  let timeout:()=>void=()=>{};
  runInNewContext(INTRO_BOOTSTRAP,{
    document:{documentElement:{
      setAttribute:(k:string,v:string)=>attrs.set(k,v),
      getAttribute:(k:string)=>attrs.get(k),
      removeAttribute:(k:string)=>attrs.delete(k)
    }},
    location:{pathname},
    matchMedia:()=>({matches:reduced}),
    sessionStorage:{getItem:(key:string)=>{assert.equal(key,INTRO_SESSION_KEY);if(brokenStorage)throw Error("unavailable");return seen?"1":null;}},
    setTimeout:(fn:()=>void)=>{timeout=fn;}
  });
  return {attrs,timeout};
}
test("first home visit opts in before hydration",()=>{
  const {attrs,timeout}=boot("/");
  assert.equal(attrs.get(INTRO_ATTRIBUTE),"pending");
  attrs.set(INTRO_ATTRIBUTE,"playing");timeout();
  assert.equal(attrs.get(INTRO_ATTRIBUTE),"playing");
});
test("repeat visits, admin and reduced motion bypass the splash",()=>{
  for(const result of [boot("/",true),boot("/admin"),boot("/",false,true)])
    assert.equal(result.attrs.has(INTRO_ATTRIBUTE),false);
});
test("pending splash cannot remain stuck if hydration fails",()=>{
  const {attrs,timeout}=boot("/",false,false,true);
  assert.equal(attrs.get(INTRO_ATTRIBUTE),"pending");timeout();
  assert.equal(attrs.has(INTRO_ATTRIBUTE),false);
});
