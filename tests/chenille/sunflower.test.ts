import assert from "node:assert/strict";
import {test} from "node:test";
import {createPetalRibs,SUNFLOWER_PETALS,stageProgress} from "../../lib/chenille/sunflower";
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
