import * as T from 'three';

export function surfaceUniforms() {
  return { visionTime: { value: 0 }, visionAmount: { value: 0 }, visionBass: { value: 0 }, visionHigh: { value: 0 } };
}
type SurfaceUniforms = ReturnType<typeof surfaceUniforms>;
// Object-space interference patterns stick to the architecture, not the screen.
export function attachSurface(material: T.Material, uniforms: SurfaceUniforms) {
  if (!(material instanceof T.MeshStandardMaterial)) return;
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec3 visionPosition;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvisionPosition = position;');
    shader.fragmentShader = `varying vec3 visionPosition; uniform float visionTime; uniform float visionAmount; uniform float visionBass; uniform float visionHigh;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      vec3 q=visionPosition; float flow=visionTime*.22;
      float cells=sin(q.x*5.+sin(q.y*4.+flow))+sin(q.y*5.+sin(q.z*4.-flow))+sin(q.z*5.+sin(q.x*4.+flow));
      float veins=1.-smoothstep(.06,.2+visionHigh*.12,abs(cells));
      vec3 spectrum=.5+.5*cos(vec3(0.,2.1,4.2)+cells+flow+visionBass*1.4);
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*(.65+spectrum*.8)+spectrum*veins*.22,visionAmount);`);
  };
  material.customProgramCacheKey = () => 'bardo-surface-v1';
}

export function perceptionMaterial() {
  return new T.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: { first: { value: null }, second: { value: null }, blend: { value: 0 }, aspect: { value: 1 }, time: { value: 0 }, bass: { value: 0 }, high: { value: 0 }, energy: { value: 0 }, psychedelic: { value: 0 }, dissociation: { value: 0 }, style: { value: 0 }, transitionPower: { value: 1 }, transitionAudio: { value: 0 }, fractal: { value: 0 }, tunnelFx: { value: 0 }, liquid: { value: 0 }, iridescence: { value: 0 }, symmetry: { value: 6 } },
    vertexShader: `varying vec2 uvv; void main(){uvv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `uniform sampler2D first; uniform sampler2D second; uniform float blend,aspect,time,bass,high,energy,psychedelic,dissociation,style,transitionPower,transitionAudio,fractal,tunnelFx,liquid,iridescence,symmetry; varying vec2 uvv;
      const float PI=3.14159265359;
      vec2 turn(vec2 p,float a){return mat2(cos(a),-sin(a),sin(a),cos(a))*p;}
      vec2 bounded(vec2 p){return clamp(p,vec2(.001),vec2(.999));}
      vec3 readWorld(sampler2D tex,vec2 uv){
        vec2 p=(uv-.5)*vec2(aspect,1.); float r=length(p),a=atan(p.y,p.x);
        // Smoothly folded radial geometry plus slow membrane refraction.
        float sector=2.*PI/symmetry;
        float folded=abs(mod(a+sector*.5,sector)-sector*.5);
        vec2 kaleido=vec2(cos(folded),sin(folded))*r;
        p=mix(p,kaleido,psychedelic*.32);
        p+=vec2(sin(p.y*11.+time*.3),cos(p.x*9.-time*.23))*psychedelic*(.004+bass*.009);
        vec2 cell=p; for(int i=0;i<3;i++){cell=abs(cell)*1.35-vec2(.21,.17);cell=turn(cell,.3);}
        p=mix(p,p+cell*.15,fractal);
        p*=1.-tunnelFx*.22*sin(log(1.+r*8.)*3.-time*.2);
        p+=liquid*.025*vec2(sin(p.y*7.+time*.25+sin(p.x*4.)),sin(p.x*8.-time*.2+cos(p.y*5.)))*(1.+bass*.3);
        vec2 st=p/vec2(aspect,1.)+.5;
        float split=psychedelic*(.001+high*.006); vec2 shift=vec2(split/aspect,0.);
        vec3 c=vec3(texture2D(tex,bounded(st+shift)).r,texture2D(tex,bounded(st)).g,texture2D(tex,bounded(st-shift)).b);
        // Simultaneous offset viewpoints, deliberately not history-dependent feedback.
        vec2 ghost=turn(p, .025*sin(time*.17))*1.035/vec2(aspect,1.)+.5;
        vec3 echo=texture2D(tex,bounded(ghost+vec2(.012*sin(time*.13),.006*cos(time*.19)))).rgb;
        vec3 echo2=texture2D(tex,bounded((p*.965)/vec2(aspect,1.)+.5)).rgb;
        c=mix(c,echo*.55+echo2*.45,dissociation*.45);
        float lace=pow(.5+.5*sin(r*55.+sin(a*8.+time*.12)*2.-time*.3),12.);
        vec3 tint=.5+.5*cos(vec3(0.,2.,4.)+r*6.+time*.1);
        c+=tint*lace*psychedelic*(.012+high*.025);
        c=mix(c,c*(.65+.6*(.5+.5*cos(vec3(0.,2.1,4.2)+r*8.+time*.15+high)))+tint*.025,iridescence);
        return c;
      }
      void main(){
        vec2 p=(uvv-.5)*vec2(aspect,1.);float angle=atan(p.y,p.x),radius=length(p),envelope=sin(blend*PI);
        float edge=radius+(.025+transitionAudio*.05*transitionPower)*sin(angle*6.+time*.12)*envelope;
        float reach=mix(-.15,length(vec2(aspect,1.))*.5+.2,blend);
        if(style>.5&&style<1.5) edge-=sin(angle*8.+time*.1)*.12*envelope;
        if(style>1.5&&style<2.5) edge+=sin(angle*3.+radius*12.-time*.2)*.09*envelope;
        float portal=1.-smoothstep(reach-.10,reach+.10,edge);
        if(style>2.5&&style<3.5){float cells=.5+.25*sin(p.x*9.+sin(p.y*7.))+.25*sin(p.y*11.-time*.12);portal=1.-smoothstep(blend-.18,blend+.18,cells);}
        if(style>3.5&&style<4.5){float facets=abs(sin(angle*6.))*radius;portal=1.-smoothstep(reach-.1,reach+.1,facets);}
        if(style>4.5&&style<5.5) portal=1.-smoothstep(reach-.1,reach+.1,radius+.1*sin(radius*24.-time*.2)*envelope);
        if(style>5.5&&style<6.5) portal=1.-smoothstep(blend-.15,blend+.15,uvv.x+.1*sin(uvv.y*16.+time*.15));
        if(style>6.5&&style<7.5) portal=1.-smoothstep(reach-.12,reach+.12,radius+.15*sin(angle*5.+radius*13.)*envelope);
        if(style>7.5&&style<8.5) portal=1.-smoothstep(blend-.15,blend+.15,abs(sin(p.x*12.)*sin(p.y*12.)));
        if(style>8.5&&style<9.5) portal=1.-smoothstep(blend*.6-.1,blend*.6+.1,abs(uvv.y-.5));
        if(style>9.5&&style<10.5) portal=1.-smoothstep(reach-.08,reach+.08,radius*(1.+.25*cos(angle*10.)*envelope));
        if(style>10.5&&style<11.5){vec2 tile=floor(uvv*12.);float n=fract(sin(dot(tile,vec2(12.98,78.23)))*43758.54);portal=1.-smoothstep(blend-.2,blend+.2,n);}
        if(style>11.5) portal=1.-smoothstep(reach-.1,reach+.1,max(abs(p.x),abs(p.y)));
        float weight=clamp(mix(blend,portal,.8*envelope),0.,1.);
        vec2 warp=p;
        if(style>1.5&&style<2.5) warp=turn(p,envelope*(.3+transitionAudio*.12)*transitionPower);
        if(style>3.5&&style<4.5) warp=mix(p,vec2(abs(p.x),p.y),envelope*.25*transitionPower);
        if(style>6.5&&style<7.5) warp=turn(p,envelope*.2*transitionPower);
        if(style>11.5) warp=p*(1.-envelope*.28*transitionPower);
        vec2 uv=warp/vec2(aspect,1.)+.5;
        vec3 c=readWorld(first,uv);
        if(blend>0.) c=mix(c,readWorld(second,uv),weight);
        c*=1.+energy*.025;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }` });
}
