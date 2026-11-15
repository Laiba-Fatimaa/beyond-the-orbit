/* Decorative Three.js starfield. The rest of the interface remains usable if WebGL/CDN is unavailable. */
const canvas = document.getElementById("space-canvas");
if (canvas) {
  import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js").then(THREE => {
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(window.innerWidth,window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.z=55;
    const count=1500, positions=new Float32Array(count*3), sizes=new Float32Array(count);
    for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*150;positions[i*3+1]=(Math.random()-.5)*100;positions[i*3+2]=(Math.random()-.5)*100;sizes[i]=Math.random();}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
    const material=new THREE.PointsMaterial({color:0xc7d5df,size:.12,transparent:true,opacity:.78,sizeAttenuation:true});
    const stars=new THREE.Points(geometry,material);scene.add(stars);
    const clock=new THREE.Clock();let raf=0,visible=true;
    function animate(){if(!visible)return;raf=requestAnimationFrame(animate);const t=clock.getElapsedTime();stars.rotation.y=t*.006;stars.rotation.x=Math.sin(t*.04)*.018;renderer.render(scene,camera);}
    animate();
    const resize=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);};
    window.addEventListener("resize",resize);
    document.addEventListener("visibilitychange",()=>{visible=!document.hidden;if(visible){clock.start();animate();}else cancelAnimationFrame(raf);});
    window.addEventListener("pagehide",()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);geometry.dispose();material.dispose();renderer.dispose();},{once:true});
  }).catch(()=>{canvas.style.display="none";});
}
