import assert from "node:assert/strict";
import {test} from "node:test";
import {createPetalRibs,SUNFLOWER_PETALS,stageProgress,createWireLoops,wirePose} from "../../lib/chenille/sunflower";
test("sunflower has two offset rows of eight filled petals",()=>{
 assert.equal(SUNFLOWER_PETALS.length,16);
 assert.equal(SUNFLOWER_PETALS.filter(p=>p.rear).length,8);
 assert.notEqual(SUNFLOWER_PETALS[0].angle,SUNFLOWER_PETALS[8].angle);
 for(const p of SUNFLOWER_PETALS){
   const ribs=createPetalRibs(p.length,p.width);assert.equal(ribs.length,7);
   for(const rib of ribs)assert.ok(rib.length>20&&rib.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)));
 }
});
test("scroll phases are clamped and reversible",()=>{
 assert.equal(stageProgress(0,.1,.44),0);assert.equal(stageProgress(1,.1,.44),1);
 assert.ok(Math.abs(stageProgress(.27,.1,.44)-.5)<1e-8);
 assert.equal(stageProgress(.1,.1,.44),0);
});

test("folding wire is continuous at every petal joint and reversible",()=>{
 const loops=createWireLoops();
 assert.equal(loops.length,16);
 assert.equal(new Set(loops.map(l=>l.index)).size,16);
 for(let i=1;i<loops.length;i++){
   const previous=loops[i-1].points.at(-1)!;
   const next=loops[i].points[0];
   assert.ok(Math.hypot(previous.x-next.x,previous.y-next.y)<1e-6);
 }
 const first=wirePose(loops,0);
 assert.ok(first.points.length>10);
 assert.ok(first.points.every(q=>Math.abs(q.y-first.points[0].y)<1e-6));
 for(let i=0;i<=256;i++){
   const p=i/256,pose=wirePose(loops,p);
   assert.ok(pose.points.length>1&&pose.points.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)));
   assert.deepEqual(pose,wirePose(loops,p));
 }
 for(let i=1;i<16;i++){
   const before=wirePose(loops,i/16-1e-7).points.at(-1)!;
   const after=wirePose(loops,i/16).points.at(-1)!;
   assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<.1);
 }
});
