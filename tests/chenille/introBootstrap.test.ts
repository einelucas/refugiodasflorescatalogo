import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { INTRO_BOOTSTRAP, INTRO_ATTRIBUTE } from "../../lib/chenille/introBootstrap";
function boot(pathname:string,reduced=false){
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
test("every new home document opts in, including refreshes",()=>{
  for(let i=0;i<3;i++)assert.equal(boot("/").attrs.get(INTRO_ATTRIBUTE),"pending");
});
test("admin and reduced motion bypass the splash",()=>{
  for(const result of [boot("/admin"),boot("/carrinho"),boot("/",true)])
    assert.equal(result.attrs.has(INTRO_ATTRIBUTE),false);
});
test("pending splash cannot remain stuck if hydration fails",()=>{
  const {attrs,timeout}=boot("/");
  assert.equal(attrs.get(INTRO_ATTRIBUTE),"pending");timeout();
  assert.equal(attrs.has(INTRO_ATTRIBUTE),false);
});
