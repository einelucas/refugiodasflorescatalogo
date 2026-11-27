import { bezier, leaf, petal, resample, spiral, stem } from "./paths";
import type { Flower, FlowerKind, Point, Thread } from "./types";

export const FLOWER_KINDS: readonly FlowerKind[] = ["rosa","girassol","tulipa","lirio","margarida","gerbera"];
export const PALETTE = { deep:"#5a1e72", mid:"#8c3faf", soft:"#a855c8", lavender:"#d9b3d9", rose:"#f5ddeb", pale:"#fdf0f7", green:"#71865c", gold:"#d5a65d" };
const thread=(points:Point[],color:string,thickness=5,seed=1):Thread=>({points:resample(points,1.8),color,thickness,seed});
export function createFlower(kind:FlowerKind):Flower {
  const petals:Thread[]=[];
  const ring=(count:number,length:number,width:number,color:string,offset=0,tip=0)=>{
    for(let i=0;i<count;i++) petals.push(thread(petal(0,-16,offset+i*Math.PI*2/count,length,width,tip),color,5,13+i));
  };
  let centerColor=PALETTE.gold, centerSize=9;
  switch(kind){
    case "rosa": ring(5,38,17,PALETTE.mid,-1.2,4);ring(4,25,12,PALETTE.soft,.3,3);ring(3,14,7,PALETTE.lavender,.7);centerColor=PALETTE.rose;centerSize=5;break;
    case "girassol": ring(13,41,8,PALETTE.gold,-Math.PI/2);centerColor=PALETTE.deep;centerSize=13;break;
    case "tulipa": ring(3,40,13,PALETTE.soft,-Math.PI*.84); // replace radial set with upright cup
      petals.length=0;
      for(const [a,l,w] of [[-2.16,41,13],[-1.02,41,13],[-Math.PI/2,47,14]]) petals.push(thread(petal(0,-16,a,l,w),PALETTE.soft,6));
      centerColor=PALETTE.lavender;centerSize=4;break;
    case "lirio": ring(6,45,13,PALETTE.rose,-Math.PI/2,5);centerColor=PALETTE.mid;break;
    case "margarida": ring(10,37,9,PALETTE.pale,-Math.PI/2);break;
    case "gerbera": ring(12,42,8,PALETTE.lavender,-Math.PI/2);ring(9,30,6,PALETTE.soft,.15);centerColor=PALETTE.deep;break;
  }
  return {petals,center:[thread(spiral(0,-16,centerSize),centerColor,5)],stem:[thread(stem(0,-12,68),PALETTE.green,5)],leaves:[thread(leaf(0,24,-.6,29,9),PALETTE.green,4),thread(leaf(0,38,-2.5,25,8),PALETTE.green,4)]};
}
export function underlinePath(width:number,height:number):Point[]{
  return resample(bezier({x:4,y:height*.53},{x:width*.29,y:height*.08},{x:width*.71,y:height*.88},{x:Math.max(4,width-4),y:height*.35}),1.6);
}
