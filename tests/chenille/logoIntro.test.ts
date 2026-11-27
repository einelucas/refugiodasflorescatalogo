import assert from "node:assert/strict";
import {test} from "node:test";
import {foldedThread,introTimeline,INTRO_DURATION,INTRO_EXIT} from "../../lib/chenille/logoIntro";

test("intro holds the straight wire and the finished logo",()=>{
  assert.equal(INTRO_DURATION,6000);
  assert.equal(INTRO_EXIT,700);
  assert.deepEqual(introTimeline(0),{fold:0,detail:0,fill:0,title:false});
  assert.equal(introTimeline(.09).fold,0);
  assert.equal(introTimeline(.63).fold,1);
  assert.equal(introTimeline(.85).detail,1);
  assert.equal(introTimeline(.91).fill,1);
  assert.deepEqual(introTimeline(.95),introTimeline(1));
  let before=introTimeline(0);
  for(let i=1;i<=100;i++){
    const current=introTimeline(i/100);
    assert.ok(current.fold>=before.fold&&current.detail>=before.detail&&current.fill>=before.fill);
    before=current;
  }
});
test("free wire remains attached and ends at the official contour",()=>{
  const points=[{x:210,y:240},{x:160,y:260},{x:70,y:170},{x:160,y:50},{x:250,y:170},{x:210,y:240}];
  const start=foldedThread(points,0);
  assert.ok(start.length>2);
  assert.ok(start.every(q=>Math.abs(q.y-160)<1e-8));
  const end=foldedThread(points,1);
  assert.deepEqual(end.slice(0,points.length),points);
  for(let i=0;i<=100;i++){
    const pose=foldedThread(points,i/100);
    assert.ok(pose.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)));
  }
  const almost=foldedThread(points,.999999).at(-1)!;
  assert.ok(Math.hypot(almost.x-end.at(-1)!.x,almost.y-end.at(-1)!.y)<.01);
});
