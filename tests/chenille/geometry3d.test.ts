import assert from "node:assert/strict";
import {test} from "node:test";
import {activeWire,centerGeometry,companionGreenery,petalGeometry,petalOrder,stemGeometry,tulipGeometry,whiteFillers,type Geometry} from "../../lib/chenille3d/geometry";

function checkMesh(g:Geometry){
  assert.ok(g.count>0);
  assert.equal(g.vertices.length,g.count*9);
  assert.equal(g.count%3,0);
  let min=Infinity,max=-Infinity;
  for(let i=0;i<g.vertices.length;i+=9){
    for(let j=0;j<9;j++)assert.ok(Number.isFinite(g.vertices[i+j]));
    min=Math.min(min,g.vertices[i+2]);max=Math.max(max,g.vertices[i+2]);
  }
  assert.ok(max-min>1,"geometry has genuine spatial depth");
}
test("all sixteen petals have finite volumetric mesh and directional fibres",()=>{
  assert.equal(new Set(petalOrder).size,16);
  for(const i of petalOrder)checkMesh(petalGeometry(i));
});
test("wire geometry survives forward and reverse scroll",()=>{
  for(const p of [0,.02,.25,.5,.75,.99,1,.75,.25,0])checkMesh(activeWire(p));
  assert.deepEqual(activeWire(.25).vertices,activeWire(.25).vertices);
});
test("all companion meshes and center have actual depth",()=>{
  for(const g of [stemGeometry(),tulipGeometry(),companionGreenery(),whiteFillers(),...centerGeometry()])checkMesh(g);
});
