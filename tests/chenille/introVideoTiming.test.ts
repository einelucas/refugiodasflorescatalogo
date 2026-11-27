import assert from "node:assert/strict";
import { test } from "node:test";
import { INTRO_VIDEO_SECONDS,INTRO_VIDEO_TITLE_SECONDS,introVideoSourceProgress } from "../../lib/chenille/introVideoTiming";

test("V2 compresses the construction and preserves the last 1.2 seconds",()=>{
  assert.equal(INTRO_VIDEO_SECONDS,4.1);
  assert.equal(introVideoSourceProgress(0),0);
  assert.ok(Math.abs(introVideoSourceProgress(2.9)-.8)<1e-9);
  assert.ok(Math.abs(introVideoSourceProgress(3.5)-.9)<1e-9);
  assert.ok(Math.abs(introVideoSourceProgress(4.1)-1)<1e-9);
  assert.ok(INTRO_VIDEO_TITLE_SECONDS<2.9);
  let last=0;
  for(let i=0;i<=123;i++){
    const p=introVideoSourceProgress(i/30);
    assert.ok(p>=last&&p<=1);last=p;
  }
});
