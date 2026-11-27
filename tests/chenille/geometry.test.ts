import assert from "node:assert/strict";
import {test} from "node:test";
import {bezier,petal,resample,seeded,spiral} from "../../lib/chenille/paths";
import {createFlower,FLOWER_KINDS} from "../../lib/chenille/flowers";
test("Bezier endpoints and deterministic fibre noise",()=>{
 const a={x:0,y:0},b={x:30,y:4};
 const curve=bezier(a,a,b,b);assert.deepEqual(curve[0],a);assert.deepEqual(curve.at(-1),b);
 const x=seeded(7),y=seeded(7);for(let i=0;i<50;i++)assert.equal(x(),y());
});
test("resampling preserves endpoints and skips duplicate vertices",()=>{
 const pts=resample([{x:0,y:0},{x:0,y:0},{x:10,y:0}],2);
 assert.equal(pts.length,6);assert.deepEqual(pts.at(-1),{x:10,y:0});
});
test("six distinct flower geometries have finite, complete paths",()=>{
 assert.equal(FLOWER_KINDS.length,6);
 for(const kind of FLOWER_KINDS){const f=createFlower(kind);for(const group of [f.petals,f.center,f.stem,f.leaves]){assert.ok(group.length>0);for(const t of group){assert.ok(t.points.length>1);assert.ok(t.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));}}}
 assert.deepEqual(petal(0,0,0,12,4)[0],petal(0,0,0,12,4).at(-1));
 assert.deepEqual(spiral(0,0,5)[0],{x:0,y:0});
});
