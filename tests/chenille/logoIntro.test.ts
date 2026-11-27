import assert from "node:assert/strict";
import {test} from "node:test";
import {revealedContour,introTimeline,INTRO_DURATION,INTRO_EXIT,advanceIntroClock} from "../../lib/chenille/logoIntro";

const points=Array.from({length:201},(_,i)=>{
  const a=Math.PI/2+i/200*Math.PI*2;
  const r=90+22*Math.cos(a*5);
  return {x:160+r*Math.cos(a),y:160+r*Math.sin(a)};
});
test("intro begins folding almost immediately and holds the finished mark",()=>{
  assert.equal(INTRO_DURATION,6000);
  assert.equal(INTRO_EXIT,700);
  assert.deepEqual(introTimeline(0),{fold:0,detail:0,fill:0,title:false});
  assert.ok(introTimeline(.017).fold>0);
  assert.equal(introTimeline(.47).detail,0);
  assert.equal(introTimeline(.48).fold,1);
  assert.ok(introTimeline(.05).fold>0);
  assert.ok(introTimeline(.1).fold>0);
  assert.equal(introTimeline(.67).fold,1);
  assert.equal(introTimeline(.89).detail,1);
  assert.equal(introTimeline(.94).fill,1);
  assert.deepEqual(introTimeline(.95),introTimeline(1));
  let before=introTimeline(0);
  for(let i=1;i<=1000;i++){
    const current=introTimeline(i/1000);
    assert.ok(current.fold>=before.fold&&current.detail>=before.detail&&current.fill>=before.fill);
    before=current;
  }
});
test("contour is revealed in place with no straight wire or deformation",()=>{
  assert.deepEqual(revealedContour(points,0),[]);
  assert.deepEqual(revealedContour(points,1),points);
  let count=0;
  for(let i=1;i<=1000;i++){
    const pose=revealedContour(points,i/1000);
    assert.ok(pose.length>=count);
    assert.deepEqual(pose.slice(0,-1),points.slice(0,pose.length-1));
    assert.ok(pose.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)));
    count=pose.length;
  }
});
test("a delayed frame advances the clock smoothly instead of skipping the motion",()=>{
  assert.equal(advanceIntroClock(0,16),16);
  assert.equal(advanceIntroClock(16,1500),80);
  assert.equal(advanceIntroClock(80,-1),80);
  assert.equal(advanceIntroClock(INTRO_DURATION-5,64),INTRO_DURATION);
});
