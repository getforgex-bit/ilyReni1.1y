/* Original Corazon mesh exported from the supplied Blender file. No runtime CDN. */
window.loadHeart3D = async function(canvas) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl) throw new Error('WebGL unavailable');
  const response=await fetch('assets/corazon.json');
  if(!response.ok) throw new Error('Heart mesh unavailable');
  const mesh=await response.json();
  // Preserve the faceted finish visible in the supplied Blender model.
  for(let i=0;i<mesh.positions.length;i+=9){const a=mesh.positions.slice(i,i+3),b=mesh.positions.slice(i+3,i+6),c=mesh.positions.slice(i+6,i+9),u=b.map((x,j)=>x-a[j]),v=c.map((x,j)=>x-a[j]);const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n)||1;for(let k=0;k<3;k++)for(let j=0;j<3;j++)mesh.normals[i+k*3+j]=n[j]/len;}
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec3 normal;uniform float angle;uniform float aspect;varying vec3 n;varying vec3 p;void main(){float c=cos(angle),s=sin(angle);mat3 r=mat3(c,0.,-s,0.,1.,0.,s,0.,c);p=r*position;n=r*normal;gl_Position=vec4(p.x*0.82/aspect,p.y*0.82,p.z*0.18,1.);}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec3 n;varying vec3 p;void main(){vec3 N=normalize(n);float key=max(dot(N,normalize(vec3(-.6,.9,1.4))),0.);float fill=max(dot(N,normalize(vec3(.9,-.1,.6))),0.);float rim=pow(1.-abs(N.z),3.);vec3 color=vec3(.25,.035,.55)*(.45+key*.85)+vec3(.16,.09,.24)*fill+vec3(.24,.12,.3)*rim;float spec=pow(max(dot(reflect(-normalize(vec3(-.6,.9,1.4)),N),vec3(0.,0.,1.)),0.),22.);color+=spec*.17;gl_FragColor=vec4(pow(color,vec3(.75)),1.);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader link failed');gl.useProgram(program);
  for(const [name,data] of [['position',mesh.positions],['normal',mesh.normals]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const angle=gl.getUniformLocation(program,'angle'),aspect=gl.getUniformLocation(program,'aspect');
  let running=false,raf=0,rotation=0,lastFrame=null;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(t){if(!running||document.hidden)return;const ratio=Math.min(devicePixelRatio||1,2),w=Math.round(canvas.clientWidth*ratio),h=Math.round(canvas.clientHeight*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);if(!reduce&&lastFrame!==null)rotation-=(Math.min(t-lastFrame,100)/32000)*Math.PI*2;lastFrame=t;gl.uniform1f(angle,reduce?-.12:rotation);gl.uniform1f(aspect,w/h);gl.drawArrays(gl.TRIANGLES,0,mesh.positions.length/3);if(!reduce)raf=requestAnimationFrame(frame);}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;canvas.hidden=true;document.getElementById('heart-fallback').hidden=false;});
  document.addEventListener('visibilitychange',()=>{lastFrame=null;if(running&&!document.hidden){cancelAnimationFrame(raf);frame(performance.now());}});
  addEventListener('resize',()=>{if(running&&reduce)frame(performance.now());});
  return {play(){running=true;rotation=0;lastFrame=null;cancelAnimationFrame(raf);frame(performance.now());},stop(){running=false;lastFrame=null;cancelAnimationFrame(raf);}};
};

