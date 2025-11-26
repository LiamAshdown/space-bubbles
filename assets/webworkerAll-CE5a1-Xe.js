import{E as f,U as Ee,T as N,M as T,l as C,c as le,H as b,t as v,a6 as ce,R as K,w as V,F as de,D as X,y as F,ad as Oe,ae as $,K as L,af as S,b as Q,B as R,s as j,u as Ve,G as Le,$ as We,_ as W,ag as Ye,n as he,q as fe,a8 as pe,ab as me,ah as ge,o as He,p as Ke,a9 as Xe,aa as $e,ac as je,ai as qe,aj as Ne,ak as Qe,al as Y,am as Je,an as Ze,m as xe,a3 as J,ao as Z,ap as A,e as g,aq as et}from"./index-B9QqJtSx.js";import{S as B,c as M,a as tt,b as rt,B as _e}from"./colorToUniform-DmtBy-2V.js";class ye{static init(e){Object.defineProperty(this,"resizeTo",{set(t){globalThis.removeEventListener("resize",this.queueResize),this._resizeTo=t,t&&(globalThis.addEventListener("resize",this.queueResize),this.resize())},get(){return this._resizeTo}}),this.queueResize=()=>{this._resizeTo&&(this._cancelResize(),this._resizeId=requestAnimationFrame(()=>this.resize()))},this._cancelResize=()=>{this._resizeId&&(cancelAnimationFrame(this._resizeId),this._resizeId=null)},this.resize=()=>{if(!this._resizeTo)return;this._cancelResize();let t,r;if(this._resizeTo===globalThis.window)t=globalThis.innerWidth,r=globalThis.innerHeight;else{const{clientWidth:n,clientHeight:s}=this._resizeTo;t=n,r=s}this.renderer.resize(t,r),this.render()},this._resizeId=null,this._resizeTo=null,this.resizeTo=e.resizeTo||null}static destroy(){globalThis.removeEventListener("resize",this.queueResize),this._cancelResize(),this._cancelResize=null,this.queueResize=null,this.resizeTo=null,this.resize=null}}ye.extension=f.Application;class be{static init(e){e=Object.assign({autoStart:!0,sharedTicker:!1},e),Object.defineProperty(this,"ticker",{set(t){this._ticker&&this._ticker.remove(this.render,this),this._ticker=t,t&&t.add(this.render,this,Ee.LOW)},get(){return this._ticker}}),this.stop=()=>{this._ticker.stop()},this.start=()=>{this._ticker.start()},this._ticker=null,this.ticker=e.sharedTicker?N.shared:new N,e.autoStart&&this.start()}static destroy(){if(this._ticker){const e=this._ticker;this.ticker=null,e.destroy()}}}be.extension=f.Application;class Te{constructor(e){this._renderer=e}push(e,t,r){this._renderer.renderPipes.batch.break(r),r.add({renderPipeId:"filter",canBundle:!1,action:"pushFilter",container:t,filterEffect:e})}pop(e,t,r){this._renderer.renderPipes.batch.break(r),r.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}execute(e){e.action==="pushFilter"?this._renderer.filter.push(e):e.action==="popFilter"&&this._renderer.filter.pop()}destroy(){this._renderer=null}}Te.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"filter"};const ee=new T;function nt(i,e){e.clear();const t=e.matrix;for(let r=0;r<i.length;r++){const n=i[r];if(n.globalDisplayStatus<7)continue;const s=n.renderGroup??n.parentRenderGroup;s?.isCachedAsTexture?e.matrix=ee.copyFrom(s.textureOffsetInverseTransform).append(n.worldTransform):s?._parentCacheAsTextureRenderGroup?e.matrix=ee.copyFrom(s._parentCacheAsTextureRenderGroup.inverseWorldTransform).append(n.groupTransform):e.matrix=n.worldTransform,e.addBounds(n.bounds)}return e.matrix=t,e}const st=new ce({attributes:{aPosition:{buffer:new Float32Array([0,0,1,0,1,1,0,1]),format:"float32x2",stride:8,offset:0}},indexBuffer:new Uint32Array([0,1,2,0,2,3])});class at{constructor(){this.skip=!1,this.inputTexture=null,this.backTexture=null,this.filters=null,this.bounds=new de,this.container=null,this.blendRequired=!1,this.outputRenderSurface=null,this.globalFrame={x:0,y:0,width:0,height:0}}}class ve{constructor(e){this._filterStackIndex=0,this._filterStack=[],this._filterGlobalUniforms=new C({uInputSize:{value:new Float32Array(4),type:"vec4<f32>"},uInputPixel:{value:new Float32Array(4),type:"vec4<f32>"},uInputClamp:{value:new Float32Array(4),type:"vec4<f32>"},uOutputFrame:{value:new Float32Array(4),type:"vec4<f32>"},uGlobalFrame:{value:new Float32Array(4),type:"vec4<f32>"},uOutputTexture:{value:new Float32Array(4),type:"vec4<f32>"}}),this._globalFilterBindGroup=new le({}),this.renderer=e}get activeBackTexture(){return this._activeFilterData?.backTexture}push(e){const t=this.renderer,r=e.filterEffect.filters,n=this._pushFilterData();n.skip=!1,n.filters=r,n.container=e.container,n.outputRenderSurface=t.renderTarget.renderSurface;const s=t.renderTarget.renderTarget.colorTexture.source,a=s.resolution,o=s.antialias;if(r.length===0){n.skip=!0;return}const u=n.bounds;if(this._calculateFilterArea(e,u),this._calculateFilterBounds(n,t.renderTarget.rootViewPort,o,a,1),n.skip)return;const l=this._getPreviousFilterData(),h=this._findFilterResolution(a);let c=0,d=0;l&&(c=l.bounds.minX,d=l.bounds.minY),this._calculateGlobalFrame(n,c,d,h,s.width,s.height),this._setupFilterTextures(n,u,t,l)}generateFilteredTexture({texture:e,filters:t}){const r=this._pushFilterData();this._activeFilterData=r,r.skip=!1,r.filters=t;const n=e.source,s=n.resolution,a=n.antialias;if(t.length===0)return r.skip=!0,e;const o=r.bounds;if(o.addRect(e.frame),this._calculateFilterBounds(r,o.rectangle,a,s,0),r.skip)return e;const u=s;this._calculateGlobalFrame(r,0,0,u,n.width,n.height),r.outputRenderSurface=b.getOptimalTexture(o.width,o.height,r.resolution,r.antialias),r.backTexture=v.EMPTY,r.inputTexture=e,this.renderer.renderTarget.finishRenderPass(),this._applyFiltersToTexture(r,!0);const d=r.outputRenderSurface;return d.source.alphaMode="premultiplied-alpha",d}pop(){const e=this.renderer,t=this._popFilterData();t.skip||(e.globalUniforms.pop(),e.renderTarget.finishRenderPass(),this._activeFilterData=t,this._applyFiltersToTexture(t,!1),t.blendRequired&&b.returnTexture(t.backTexture),b.returnTexture(t.inputTexture))}getBackTexture(e,t,r){const n=e.colorTexture.source._resolution,s=b.getOptimalTexture(t.width,t.height,n,!1);let a=t.minX,o=t.minY;r&&(a-=r.minX,o-=r.minY),a=Math.floor(a*n),o=Math.floor(o*n);const u=Math.ceil(t.width*n),l=Math.ceil(t.height*n);return this.renderer.renderTarget.copyToTexture(e,s,{x:a,y:o},{width:u,height:l},{x:0,y:0}),s}applyFilter(e,t,r,n){const s=this.renderer,a=this._activeFilterData,u=a.outputRenderSurface===r,l=s.renderTarget.rootRenderTarget.colorTexture.source._resolution,h=this._findFilterResolution(l);let c=0,d=0;if(u){const p=this._findPreviousFilterOffset();c=p.x,d=p.y}this._updateFilterUniforms(t,r,a,c,d,h,u,n),this._setupBindGroupsAndRender(e,t,s)}calculateSpriteMatrix(e,t){const r=this._activeFilterData,n=e.set(r.inputTexture._source.width,0,0,r.inputTexture._source.height,r.bounds.minX,r.bounds.minY),s=t.worldTransform.copyTo(T.shared),a=t.renderGroup||t.parentRenderGroup;return a&&a.cacheToLocalTransform&&s.prepend(a.cacheToLocalTransform),s.invert(),n.prepend(s),n.scale(1/t.texture.orig.width,1/t.texture.orig.height),n.translate(t.anchor.x,t.anchor.y),n}destroy(){}_setupBindGroupsAndRender(e,t,r){if(r.renderPipes.uniformBatch){const n=r.renderPipes.uniformBatch.getUboResource(this._filterGlobalUniforms);this._globalFilterBindGroup.setResource(n,0)}else this._globalFilterBindGroup.setResource(this._filterGlobalUniforms,0);this._globalFilterBindGroup.setResource(t.source,1),this._globalFilterBindGroup.setResource(t.source.style,2),e.groups[0]=this._globalFilterBindGroup,r.encoder.draw({geometry:st,shader:e,state:e._state,topology:"triangle-list"}),r.type===K.WEBGL&&r.renderTarget.finishRenderPass()}_setupFilterTextures(e,t,r,n){if(e.backTexture=v.EMPTY,e.inputTexture=b.getOptimalTexture(t.width,t.height,e.resolution,e.antialias),e.blendRequired){r.renderTarget.finishRenderPass();const s=r.renderTarget.getRenderTarget(e.outputRenderSurface);e.backTexture=this.getBackTexture(s,t,n?.bounds)}r.renderTarget.bind(e.inputTexture,!0),r.globalUniforms.push({offset:t})}_calculateGlobalFrame(e,t,r,n,s,a){const o=e.globalFrame;o.x=t*n,o.y=r*n,o.width=s*n,o.height=a*n}_updateFilterUniforms(e,t,r,n,s,a,o,u){const l=this._filterGlobalUniforms.uniforms,h=l.uOutputFrame,c=l.uInputSize,d=l.uInputPixel,p=l.uInputClamp,_=l.uGlobalFrame,x=l.uOutputTexture;o?(h[0]=r.bounds.minX-n,h[1]=r.bounds.minY-s):(h[0]=0,h[1]=0),h[2]=e.frame.width,h[3]=e.frame.height,c[0]=e.source.width,c[1]=e.source.height,c[2]=1/c[0],c[3]=1/c[1],d[0]=e.source.pixelWidth,d[1]=e.source.pixelHeight,d[2]=1/d[0],d[3]=1/d[1],p[0]=.5*d[2],p[1]=.5*d[3],p[2]=e.frame.width*c[2]-.5*d[2],p[3]=e.frame.height*c[3]-.5*d[3];const m=this.renderer.renderTarget.rootRenderTarget.colorTexture;_[0]=n*a,_[1]=s*a,_[2]=m.source.width*a,_[3]=m.source.height*a,t instanceof v&&(t.source.resource=null);const y=this.renderer.renderTarget.getRenderTarget(t);this.renderer.renderTarget.bind(t,!!u),t instanceof v?(x[0]=t.frame.width,x[1]=t.frame.height):(x[0]=y.width,x[1]=y.height),x[2]=y.isRoot?-1:1,this._filterGlobalUniforms.update()}_findFilterResolution(e){let t=this._filterStackIndex-1;for(;t>0&&this._filterStack[t].skip;)--t;return t>0&&this._filterStack[t].inputTexture?this._filterStack[t].inputTexture.source._resolution:e}_findPreviousFilterOffset(){let e=0,t=0,r=this._filterStackIndex;for(;r>0;){r--;const n=this._filterStack[r];if(!n.skip){e=n.bounds.minX,t=n.bounds.minY;break}}return{x:e,y:t}}_calculateFilterArea(e,t){if(e.renderables?nt(e.renderables,t):e.filterEffect.filterArea?(t.clear(),t.addRect(e.filterEffect.filterArea),t.applyMatrix(e.container.worldTransform)):e.container.getFastGlobalBounds(!0,t),e.container){const n=(e.container.renderGroup||e.container.parentRenderGroup).cacheToLocalTransform;n&&t.applyMatrix(n)}}_applyFiltersToTexture(e,t){const r=e.inputTexture,n=e.bounds,s=e.filters;if(this._globalFilterBindGroup.setResource(r.source.style,2),this._globalFilterBindGroup.setResource(e.backTexture.source,3),s.length===1)s[0].apply(this,r,e.outputRenderSurface,t);else{let a=e.inputTexture;const o=b.getOptimalTexture(n.width,n.height,a.source._resolution,!1);let u=o,l=0;for(l=0;l<s.length-1;++l){s[l].apply(this,a,u,!0);const c=a;a=u,u=c}s[l].apply(this,a,e.outputRenderSurface,t),b.returnTexture(o)}}_calculateFilterBounds(e,t,r,n,s){const a=this.renderer,o=e.bounds,u=e.filters;let l=1/0,h=0,c=!0,d=!1,p=!1,_=!0;for(let x=0;x<u.length;x++){const m=u[x];if(l=Math.min(l,m.resolution==="inherit"?n:m.resolution),h+=m.padding,m.antialias==="off"?c=!1:m.antialias==="inherit"&&c&&(c=r),m.clipToViewport||(_=!1),!!!(m.compatibleRenderers&a.type)){p=!1;break}if(m.blendRequired&&!(a.backBuffer?.useBackBuffer??!0)){V("Blend filter requires backBuffer on WebGL renderer to be enabled. Set `useBackBuffer: true` in the renderer options."),p=!1;break}p=m.enabled||p,d||(d=m.blendRequired)}if(!p){e.skip=!0;return}if(_&&o.fitBounds(0,t.width/n,0,t.height/n),o.scale(l).ceil().scale(1/l).pad((h|0)*s),!o.isPositive){e.skip=!0;return}e.antialias=c,e.resolution=l,e.blendRequired=d}_popFilterData(){return this._filterStackIndex--,this._filterStack[this._filterStackIndex]}_getPreviousFilterData(){let e,t=this._filterStackIndex-1;for(;t>0&&(t--,e=this._filterStack[t],!!e.skip););return e}_pushFilterData(){let e=this._filterStack[this._filterStackIndex];return e||(e=this._filterStack[this._filterStackIndex]=new at),this._filterStackIndex++,e}}ve.extension={type:[f.WebGLSystem,f.WebGPUSystem],name:"filter"};const te="http://www.w3.org/2000/svg",re="http://www.w3.org/1999/xhtml";class Ce{constructor(){this.svgRoot=document.createElementNS(te,"svg"),this.foreignObject=document.createElementNS(te,"foreignObject"),this.domElement=document.createElementNS(re,"div"),this.styleElement=document.createElementNS(re,"style");const{foreignObject:e,svgRoot:t,styleElement:r,domElement:n}=this;e.setAttribute("width","10000"),e.setAttribute("height","10000"),e.style.overflow="hidden",t.appendChild(e),e.appendChild(r),e.appendChild(n),this.image=X.get().createImage()}destroy(){this.svgRoot.remove(),this.foreignObject.remove(),this.styleElement.remove(),this.domElement.remove(),this.image.src="",this.image.remove(),this.svgRoot=null,this.foreignObject=null,this.styleElement=null,this.domElement=null,this.image=null,this.canvasAndContext=null}}let ne;function it(i,e,t,r){r||(r=ne||(ne=new Ce));const{domElement:n,styleElement:s,svgRoot:a}=r;n.innerHTML=`<style>${e.cssStyle};</style><div style='padding:0'>${i}</div>`,n.setAttribute("style","transform-origin: top left; display: inline-block"),t&&(s.textContent=t),document.body.appendChild(a);const o=n.getBoundingClientRect();a.remove();const u=e.padding*2;return{width:o.width-u,height:o.height-u}}class ot{constructor(){this.batches=[],this.batched=!1}destroy(){this.batches.forEach(e=>{F.return(e)}),this.batches.length=0}}class Pe{constructor(e,t){this.state=B.for2d(),this.renderer=e,this._adaptor=t,this.renderer.runners.contextChange.add(this)}contextChange(){this._adaptor.contextChange(this.renderer)}validateRenderable(e){const t=e.context,r=!!e._gpuData,n=this.renderer.graphicsContext.updateGpuContext(t);return!!(n.isBatchable||r!==n.isBatchable)}addRenderable(e,t){const r=this.renderer.graphicsContext.updateGpuContext(e.context);e.didViewUpdate&&this._rebuild(e),r.isBatchable?this._addToBatcher(e,t):(this.renderer.renderPipes.batch.break(t),t.add(e))}updateRenderable(e){const r=this._getGpuDataForRenderable(e).batches;for(let n=0;n<r.length;n++){const s=r[n];s._batcher.updateElement(s)}}execute(e){if(!e.isRenderable)return;const t=this.renderer,r=e.context;if(!t.graphicsContext.getGpuContext(r).batches.length)return;const s=r.customShader||this._adaptor.shader;this.state.blendMode=e.groupBlendMode;const a=s.resources.localUniforms.uniforms;a.uTransformMatrix=e.groupTransform,a.uRound=t._roundPixels|e._roundPixels,M(e.groupColorAlpha,a.uColor,0),this._adaptor.execute(this,e)}_rebuild(e){const t=this._getGpuDataForRenderable(e),r=this.renderer.graphicsContext.updateGpuContext(e.context);t.destroy(),r.isBatchable&&this._updateBatchesForRenderable(e,t)}_addToBatcher(e,t){const r=this.renderer.renderPipes.batch,n=this._getGpuDataForRenderable(e).batches;for(let s=0;s<n.length;s++){const a=n[s];r.addToBatch(a,t)}}_getGpuDataForRenderable(e){return e._gpuData[this.renderer.uid]||this._initGpuDataForRenderable(e)}_initGpuDataForRenderable(e){const t=new ot;return e._gpuData[this.renderer.uid]=t,t}_updateBatchesForRenderable(e,t){const r=e.context,n=this.renderer.graphicsContext.getGpuContext(r),s=this.renderer._roundPixels|e._roundPixels;t.batches=n.batches.map(a=>{const o=F.get(Oe);return a.copyTo(o),o.renderable=e,o.roundPixels=s,o})}destroy(){this.renderer=null,this._adaptor.destroy(),this._adaptor=null,this.state=null}}Pe.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"graphics"};class q{constructor(){this.batcherName="default",this.packAsQuad=!1,this.indexOffset=0,this.attributeOffset=0,this.roundPixels=0,this._batcher=null,this._batch=null,this._textureMatrixUpdateId=-1,this._uvUpdateId=-1}get blendMode(){return this.renderable.groupBlendMode}get topology(){return this._topology||this.geometry.topology}set topology(e){this._topology=e}reset(){this.renderable=null,this.texture=null,this._batcher=null,this._batch=null,this.geometry=null,this._uvUpdateId=-1,this._textureMatrixUpdateId=-1}setTexture(e){this.texture!==e&&(this.texture=e,this._textureMatrixUpdateId=-1)}get uvs(){const t=this.geometry.getBuffer("aUV"),r=t.data;let n=r;const s=this.texture.textureMatrix;return s.isSimple||(n=this._transformedUvs,(this._textureMatrixUpdateId!==s._updateID||this._uvUpdateId!==t._updateID)&&((!n||n.length<r.length)&&(n=this._transformedUvs=new Float32Array(r.length)),this._textureMatrixUpdateId=s._updateID,this._uvUpdateId=t._updateID,s.multiplyUvs(r,n))),n}get positions(){return this.geometry.positions}get indices(){return this.geometry.indices}get color(){return this.renderable.groupColorAlpha}get groupTransform(){return this.renderable.groupTransform}get attributeSize(){return this.geometry.positions.length/2}get indexSize(){return this.geometry.indices.length}}class se{destroy(){}}class we{constructor(e,t){this.localUniforms=new C({uTransformMatrix:{value:new T,type:"mat3x3<f32>"},uColor:{value:new Float32Array([1,1,1,1]),type:"vec4<f32>"},uRound:{value:0,type:"f32"}}),this.localUniformsBindGroup=new le({0:this.localUniforms}),this.renderer=e,this._adaptor=t,this._adaptor.init()}validateRenderable(e){const t=this._getMeshData(e),r=t.batched,n=e.batched;if(t.batched=n,r!==n)return!0;if(n){const s=e._geometry;if(s.indices.length!==t.indexSize||s.positions.length!==t.vertexSize)return t.indexSize=s.indices.length,t.vertexSize=s.positions.length,!0;const a=this._getBatchableMesh(e);return a.texture.uid!==e._texture.uid&&(a._textureMatrixUpdateId=-1),!a._batcher.checkAndUpdateTexture(a,e._texture)}return!1}addRenderable(e,t){const r=this.renderer.renderPipes.batch,n=this._getMeshData(e);if(e.didViewUpdate&&(n.indexSize=e._geometry.indices?.length,n.vertexSize=e._geometry.positions?.length),n.batched){const s=this._getBatchableMesh(e);s.setTexture(e._texture),s.geometry=e._geometry,r.addToBatch(s,t)}else r.break(t),t.add(e)}updateRenderable(e){if(e.batched){const t=this._getBatchableMesh(e);t.setTexture(e._texture),t.geometry=e._geometry,t._batcher.updateElement(t)}}execute(e){if(!e.isRenderable)return;e.state.blendMode=$(e.groupBlendMode,e.texture._source);const t=this.localUniforms;t.uniforms.uTransformMatrix=e.groupTransform,t.uniforms.uRound=this.renderer._roundPixels|e._roundPixels,t.update(),M(e.groupColorAlpha,t.uniforms.uColor,0),this._adaptor.execute(this,e)}_getMeshData(e){var t,r;return(t=e._gpuData)[r=this.renderer.uid]||(t[r]=new se),e._gpuData[this.renderer.uid].meshData||this._initMeshData(e)}_initMeshData(e){return e._gpuData[this.renderer.uid].meshData={batched:e.batched,indexSize:0,vertexSize:0},e._gpuData[this.renderer.uid].meshData}_getBatchableMesh(e){var t,r;return(t=e._gpuData)[r=this.renderer.uid]||(t[r]=new se),e._gpuData[this.renderer.uid].batchableMesh||this._initBatchableMesh(e)}_initBatchableMesh(e){const t=new q;return t.renderable=e,t.setTexture(e._texture),t.transform=e.groupTransform,t.roundPixels=this.renderer._roundPixels|e._roundPixels,e._gpuData[this.renderer.uid].batchableMesh=t,t}destroy(){this.localUniforms=null,this.localUniformsBindGroup=null,this._adaptor.destroy(),this._adaptor=null,this.renderer=null}}we.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"mesh"};class ut{execute(e,t){const r=e.state,n=e.renderer,s=t.shader||e.defaultShader;s.resources.uTexture=t.texture._source,s.resources.uniforms=e.localUniforms;const a=n.gl,o=e.getBuffers(t);n.shader.bind(s),n.state.set(r),n.geometry.bind(o.geometry,s.glProgram);const l=o.geometry.indexBuffer.data.BYTES_PER_ELEMENT===2?a.UNSIGNED_SHORT:a.UNSIGNED_INT;a.drawElements(a.TRIANGLES,t.particleChildren.length*6,l,0)}}class lt{execute(e,t){const r=e.renderer,n=t.shader||e.defaultShader;n.groups[0]=r.renderPipes.uniformBatch.getUniformBindGroup(e.localUniforms,!0),n.groups[1]=r.texture.getTextureBindGroup(t.texture);const s=e.state,a=e.getBuffers(t);r.encoder.draw({geometry:a.geometry,shader:t.shader||e.defaultShader,state:s,size:t.particleChildren.length*6})}}function ae(i,e=null){const t=i*6;if(t>65535?e||(e=new Uint32Array(t)):e||(e=new Uint16Array(t)),e.length!==t)throw new Error(`Out buffer length is incorrect, got ${e.length} and expected ${t}`);for(let r=0,n=0;r<t;r+=6,n+=4)e[r+0]=n+0,e[r+1]=n+1,e[r+2]=n+2,e[r+3]=n+0,e[r+4]=n+2,e[r+5]=n+3;return e}function ct(i){return{dynamicUpdate:ie(i,!0),staticUpdate:ie(i,!1)}}function ie(i,e){const t=[];t.push(`

        var index = 0;

        for (let i = 0; i < ps.length; ++i)
        {
            const p = ps[i];

            `);let r=0;for(const s in i){const a=i[s];if(e!==a.dynamic)continue;t.push(`offset = index + ${r}`),t.push(a.code);const o=L(a.format);r+=o.stride/4}t.push(`
            index += stride * 4;
        }
    `),t.unshift(`
        var stride = ${r};
    `);const n=t.join(`
`);return new Function("ps","f32v","u32v",n)}class dt{constructor(e){this._size=0,this._generateParticleUpdateCache={};const t=this._size=e.size??1e3,r=e.properties;let n=0,s=0;for(const h in r){const c=r[h],d=L(c.format);c.dynamic?s+=d.stride:n+=d.stride}this._dynamicStride=s/4,this._staticStride=n/4,this.staticAttributeBuffer=new S(t*4*n),this.dynamicAttributeBuffer=new S(t*4*s),this.indexBuffer=ae(t);const a=new ce;let o=0,u=0;this._staticBuffer=new Q({data:new Float32Array(1),label:"static-particle-buffer",shrinkToFit:!1,usage:R.VERTEX|R.COPY_DST}),this._dynamicBuffer=new Q({data:new Float32Array(1),label:"dynamic-particle-buffer",shrinkToFit:!1,usage:R.VERTEX|R.COPY_DST});for(const h in r){const c=r[h],d=L(c.format);c.dynamic?(a.addAttribute(c.attributeName,{buffer:this._dynamicBuffer,stride:this._dynamicStride*4,offset:o*4,format:c.format}),o+=d.size):(a.addAttribute(c.attributeName,{buffer:this._staticBuffer,stride:this._staticStride*4,offset:u*4,format:c.format}),u+=d.size)}a.addIndex(this.indexBuffer);const l=this.getParticleUpdate(r);this._dynamicUpload=l.dynamicUpdate,this._staticUpload=l.staticUpdate,this.geometry=a}getParticleUpdate(e){const t=ht(e);return this._generateParticleUpdateCache[t]?this._generateParticleUpdateCache[t]:(this._generateParticleUpdateCache[t]=this.generateParticleUpdate(e),this._generateParticleUpdateCache[t])}generateParticleUpdate(e){return ct(e)}update(e,t){e.length>this._size&&(t=!0,this._size=Math.max(e.length,this._size*1.5|0),this.staticAttributeBuffer=new S(this._size*this._staticStride*4*4),this.dynamicAttributeBuffer=new S(this._size*this._dynamicStride*4*4),this.indexBuffer=ae(this._size),this.geometry.indexBuffer.setDataWithSize(this.indexBuffer,this.indexBuffer.byteLength,!0));const r=this.dynamicAttributeBuffer;if(this._dynamicUpload(e,r.float32View,r.uint32View),this._dynamicBuffer.setDataWithSize(this.dynamicAttributeBuffer.float32View,e.length*this._dynamicStride*4,!0),t){const n=this.staticAttributeBuffer;this._staticUpload(e,n.float32View,n.uint32View),this._staticBuffer.setDataWithSize(n.float32View,e.length*this._staticStride*4,!0)}}destroy(){this._staticBuffer.destroy(),this._dynamicBuffer.destroy(),this.geometry.destroy()}}function ht(i){const e=[];for(const t in i){const r=i[t];e.push(t,r.code,r.dynamic?"d":"s")}return e.join("_")}var ft=`varying vec2 vUV;
varying vec4 vColor;

uniform sampler2D uTexture;

void main(void){
    vec4 color = texture2D(uTexture, vUV) * vColor;
    gl_FragColor = color;
}`,pt=`attribute vec2 aVertex;
attribute vec2 aUV;
attribute vec4 aColor;

attribute vec2 aPosition;
attribute float aRotation;

uniform mat3 uTranslationMatrix;
uniform float uRound;
uniform vec2 uResolution;
uniform vec4 uColor;

varying vec2 vUV;
varying vec4 vColor;

vec2 roundPixels(vec2 position, vec2 targetSize)
{       
    return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
}

void main(void){
    float cosRotation = cos(aRotation);
    float sinRotation = sin(aRotation);
    float x = aVertex.x * cosRotation - aVertex.y * sinRotation;
    float y = aVertex.x * sinRotation + aVertex.y * cosRotation;

    vec2 v = vec2(x, y);
    v = v + aPosition;

    gl_Position = vec4((uTranslationMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);

    if(uRound == 1.0)
    {
        gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
    }

    vUV = aUV;
    vColor = vec4(aColor.rgb * aColor.a, aColor.a) * uColor;
}
`,oe=`
struct ParticleUniforms {
  uTranslationMatrix:mat3x3<f32>,
  uColor:vec4<f32>,
  uRound:f32,
  uResolution:vec2<f32>,
};

fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
{
  return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
}

@group(0) @binding(0) var<uniform> uniforms: ParticleUniforms;

@group(1) @binding(0) var uTexture: texture_2d<f32>;
@group(1) @binding(1) var uSampler : sampler;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) color : vec4<f32>,
  };
@vertex
fn mainVertex(
  @location(0) aVertex: vec2<f32>,
  @location(1) aPosition: vec2<f32>,
  @location(2) aUV: vec2<f32>,
  @location(3) aColor: vec4<f32>,
  @location(4) aRotation: f32,
) -> VSOutput {
  
   let v = vec2(
       aVertex.x * cos(aRotation) - aVertex.y * sin(aRotation),
       aVertex.x * sin(aRotation) + aVertex.y * cos(aRotation)
   ) + aPosition;

   var position = vec4((uniforms.uTranslationMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);

   if(uniforms.uRound == 1.0) {
       position = vec4(roundPixels(position.xy, uniforms.uResolution), position.zw);
   }

    let vColor = vec4(aColor.rgb * aColor.a, aColor.a) * uniforms.uColor;

  return VSOutput(
   position,
   aUV,
   vColor,
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) color: vec4<f32>,
  @builtin(position) position: vec4<f32>,
) -> @location(0) vec4<f32> {

    var sample = textureSample(uTexture, uSampler, uv) * color;
   
    return sample;
}`;class mt extends j{constructor(){const e=Ve.from({vertex:pt,fragment:ft}),t=Le.from({fragment:{source:oe,entryPoint:"mainFragment"},vertex:{source:oe,entryPoint:"mainVertex"}});super({glProgram:e,gpuProgram:t,resources:{uTexture:v.WHITE.source,uSampler:new W({}),uniforms:{uTranslationMatrix:{value:new T,type:"mat3x3<f32>"},uColor:{value:new We(16777215),type:"vec4<f32>"},uRound:{value:1,type:"f32"},uResolution:{value:[0,0],type:"vec2<f32>"}}}})}}class Se{constructor(e,t){this.state=B.for2d(),this.localUniforms=new C({uTranslationMatrix:{value:new T,type:"mat3x3<f32>"},uColor:{value:new Float32Array(4),type:"vec4<f32>"},uRound:{value:1,type:"f32"},uResolution:{value:[0,0],type:"vec2<f32>"}}),this.renderer=e,this.adaptor=t,this.defaultShader=new mt,this.state=B.for2d()}validateRenderable(e){return!1}addRenderable(e,t){this.renderer.renderPipes.batch.break(t),t.add(e)}getBuffers(e){return e._gpuData[this.renderer.uid]||this._initBuffer(e)}_initBuffer(e){return e._gpuData[this.renderer.uid]=new dt({size:e.particleChildren.length,properties:e._properties}),e._gpuData[this.renderer.uid]}updateRenderable(e){}execute(e){const t=e.particleChildren;if(t.length===0)return;const r=this.renderer,n=this.getBuffers(e);e.texture||(e.texture=t[0].texture);const s=this.state;n.update(t,e._childrenDirty),e._childrenDirty=!1,s.blendMode=$(e.blendMode,e.texture._source);const a=this.localUniforms.uniforms,o=a.uTranslationMatrix;e.worldTransform.copyTo(o),o.prepend(r.globalUniforms.globalUniformData.projectionMatrix),a.uResolution=r.globalUniforms.globalUniformData.resolution,a.uRound=r._roundPixels|e._roundPixels,M(e.groupColorAlpha,a.uColor,0),this.adaptor.execute(this,e)}destroy(){this.renderer=null,this.defaultShader&&(this.defaultShader.destroy(),this.defaultShader=null)}}class Re extends Se{constructor(e){super(e,new ut)}}Re.extension={type:[f.WebGLPipes],name:"particle"};class Ue extends Se{constructor(e){super(e,new lt)}}Ue.extension={type:[f.WebGPUPipes],name:"particle"};class gt extends q{constructor(){super(),this.geometry=new Ye}destroy(){this.geometry.destroy()}}class Fe{constructor(e){this._renderer=e}addRenderable(e,t){const r=this._getGpuSprite(e);e.didViewUpdate&&this._updateBatchableSprite(e,r),this._renderer.renderPipes.batch.addToBatch(r,t)}updateRenderable(e){const t=this._getGpuSprite(e);e.didViewUpdate&&this._updateBatchableSprite(e,t),t._batcher.updateElement(t)}validateRenderable(e){const t=this._getGpuSprite(e);return!t._batcher.checkAndUpdateTexture(t,e._texture)}_updateBatchableSprite(e,t){t.geometry.update(e),t.setTexture(e._texture)}_getGpuSprite(e){return e._gpuData[this._renderer.uid]||this._initGPUSprite(e)}_initGPUSprite(e){const t=e._gpuData[this._renderer.uid]=new gt,r=t;return r.renderable=e,r.transform=e.groupTransform,r.texture=e._texture,r.roundPixels=this._renderer._roundPixels|e._roundPixels,e.didViewUpdate||this._updateBatchableSprite(e,r),t}destroy(){this._renderer=null}}Fe.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"nineSliceSprite"};const xt={name:"tiling-bit",vertex:{header:`
            struct TilingUniforms {
                uMapCoord:mat3x3<f32>,
                uClampFrame:vec4<f32>,
                uClampOffset:vec2<f32>,
                uTextureTransform:mat3x3<f32>,
                uSizeAnchor:vec4<f32>
            };

            @group(2) @binding(0) var<uniform> tilingUniforms: TilingUniforms;
            @group(2) @binding(1) var uTexture: texture_2d<f32>;
            @group(2) @binding(2) var uSampler: sampler;
        `,main:`
            uv = (tilingUniforms.uTextureTransform * vec3(uv, 1.0)).xy;

            position = (position - tilingUniforms.uSizeAnchor.zw) * tilingUniforms.uSizeAnchor.xy;
        `},fragment:{header:`
            struct TilingUniforms {
                uMapCoord:mat3x3<f32>,
                uClampFrame:vec4<f32>,
                uClampOffset:vec2<f32>,
                uTextureTransform:mat3x3<f32>,
                uSizeAnchor:vec4<f32>
            };

            @group(2) @binding(0) var<uniform> tilingUniforms: TilingUniforms;
            @group(2) @binding(1) var uTexture: texture_2d<f32>;
            @group(2) @binding(2) var uSampler: sampler;
        `,main:`

            var coord = vUV + ceil(tilingUniforms.uClampOffset - vUV);
            coord = (tilingUniforms.uMapCoord * vec3(coord, 1.0)).xy;
            var unclamped = coord;
            coord = clamp(coord, tilingUniforms.uClampFrame.xy, tilingUniforms.uClampFrame.zw);

            var bias = 0.;

            if(unclamped.x == coord.x && unclamped.y == coord.y)
            {
                bias = -32.;
            }

            outColor = textureSampleBias(uTexture, uSampler, coord, bias);
        `}},_t={name:"tiling-bit",vertex:{header:`
            uniform mat3 uTextureTransform;
            uniform vec4 uSizeAnchor;

        `,main:`
            uv = (uTextureTransform * vec3(aUV, 1.0)).xy;

            position = (position - uSizeAnchor.zw) * uSizeAnchor.xy;
        `},fragment:{header:`
            uniform sampler2D uTexture;
            uniform mat3 uMapCoord;
            uniform vec4 uClampFrame;
            uniform vec2 uClampOffset;
        `,main:`

        vec2 coord = vUV + ceil(uClampOffset - vUV);
        coord = (uMapCoord * vec3(coord, 1.0)).xy;
        vec2 unclamped = coord;
        coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);

        outColor = texture(uTexture, coord, unclamped == coord ? 0.0 : -32.0);// lod-bias very negative to force lod 0

        `}};let z,k;class yt extends j{constructor(){z??(z=he({name:"tiling-sprite-shader",bits:[tt,xt,fe]})),k??(k=pe({name:"tiling-sprite-shader",bits:[rt,_t,me]}));const e=new C({uMapCoord:{value:new T,type:"mat3x3<f32>"},uClampFrame:{value:new Float32Array([0,0,1,1]),type:"vec4<f32>"},uClampOffset:{value:new Float32Array([0,0]),type:"vec2<f32>"},uTextureTransform:{value:new T,type:"mat3x3<f32>"},uSizeAnchor:{value:new Float32Array([100,100,.5,.5]),type:"vec4<f32>"}});super({glProgram:k,gpuProgram:z,resources:{localUniforms:new C({uTransformMatrix:{value:new T,type:"mat3x3<f32>"},uColor:{value:new Float32Array([1,1,1,1]),type:"vec4<f32>"},uRound:{value:0,type:"f32"}}),tilingUniforms:e,uTexture:v.EMPTY.source,uSampler:v.EMPTY.source.style}})}updateUniforms(e,t,r,n,s,a){const o=this.resources.tilingUniforms,u=a.width,l=a.height,h=a.textureMatrix,c=o.uniforms.uTextureTransform;c.set(r.a*u/e,r.b*u/t,r.c*l/e,r.d*l/t,r.tx/e,r.ty/t),c.invert(),o.uniforms.uMapCoord=h.mapCoord,o.uniforms.uClampFrame=h.uClampFrame,o.uniforms.uClampOffset=h.uClampOffset,o.uniforms.uTextureTransform=c,o.uniforms.uSizeAnchor[0]=e,o.uniforms.uSizeAnchor[1]=t,o.uniforms.uSizeAnchor[2]=n,o.uniforms.uSizeAnchor[3]=s,a&&(this.resources.uTexture=a.source,this.resources.uSampler=a.source.style)}}class bt extends ge{constructor(){super({positions:new Float32Array([0,0,1,0,1,1,0,1]),uvs:new Float32Array([0,0,1,0,1,1,0,1]),indices:new Uint32Array([0,1,2,0,2,3])})}}function Tt(i,e){const t=i.anchor.x,r=i.anchor.y;e[0]=-t*i.width,e[1]=-r*i.height,e[2]=(1-t)*i.width,e[3]=-r*i.height,e[4]=(1-t)*i.width,e[5]=(1-r)*i.height,e[6]=-t*i.width,e[7]=(1-r)*i.height}function vt(i,e,t,r){let n=0;const s=i.length/e,a=r.a,o=r.b,u=r.c,l=r.d,h=r.tx,c=r.ty;for(t*=e;n<s;){const d=i[t],p=i[t+1];i[t]=a*d+u*p+h,i[t+1]=o*d+l*p+c,t+=e,n++}}function Ct(i,e){const t=i.texture,r=t.frame.width,n=t.frame.height;let s=0,a=0;i.applyAnchorToTexture&&(s=i.anchor.x,a=i.anchor.y),e[0]=e[6]=-s,e[2]=e[4]=1-s,e[1]=e[3]=-a,e[5]=e[7]=1-a;const o=T.shared;o.copyFrom(i._tileTransform.matrix),o.tx/=i.width,o.ty/=i.height,o.invert(),o.scale(i.width/r,i.height/n),vt(e,2,0,o)}const U=new bt;class Pt{constructor(){this.canBatch=!0,this.geometry=new ge({indices:U.indices.slice(),positions:U.positions.slice(),uvs:U.uvs.slice()})}destroy(){this.geometry.destroy(),this.shader?.destroy()}}class Be{constructor(e){this._state=B.default2d,this._renderer=e}validateRenderable(e){const t=this._getTilingSpriteData(e),r=t.canBatch;this._updateCanBatch(e);const n=t.canBatch;if(n&&n===r){const{batchableMesh:s}=t;return!s._batcher.checkAndUpdateTexture(s,e.texture)}return r!==n}addRenderable(e,t){const r=this._renderer.renderPipes.batch;this._updateCanBatch(e);const n=this._getTilingSpriteData(e),{geometry:s,canBatch:a}=n;if(a){n.batchableMesh||(n.batchableMesh=new q);const o=n.batchableMesh;e.didViewUpdate&&(this._updateBatchableMesh(e),o.geometry=s,o.renderable=e,o.transform=e.groupTransform,o.setTexture(e._texture)),o.roundPixels=this._renderer._roundPixels|e._roundPixels,r.addToBatch(o,t)}else r.break(t),n.shader||(n.shader=new yt),this.updateRenderable(e),t.add(e)}execute(e){const{shader:t}=this._getTilingSpriteData(e);t.groups[0]=this._renderer.globalUniforms.bindGroup;const r=t.resources.localUniforms.uniforms;r.uTransformMatrix=e.groupTransform,r.uRound=this._renderer._roundPixels|e._roundPixels,M(e.groupColorAlpha,r.uColor,0),this._state.blendMode=$(e.groupBlendMode,e.texture._source),this._renderer.encoder.draw({geometry:U,shader:t,state:this._state})}updateRenderable(e){const t=this._getTilingSpriteData(e),{canBatch:r}=t;if(r){const{batchableMesh:n}=t;e.didViewUpdate&&this._updateBatchableMesh(e),n._batcher.updateElement(n)}else if(e.didViewUpdate){const{shader:n}=t;n.updateUniforms(e.width,e.height,e._tileTransform.matrix,e.anchor.x,e.anchor.y,e.texture)}}_getTilingSpriteData(e){return e._gpuData[this._renderer.uid]||this._initTilingSpriteData(e)}_initTilingSpriteData(e){const t=new Pt;return t.renderable=e,e._gpuData[this._renderer.uid]=t,t}_updateBatchableMesh(e){const t=this._getTilingSpriteData(e),{geometry:r}=t,n=e.texture.source.style;n.addressMode!=="repeat"&&(n.addressMode="repeat",n.update()),Ct(e,r.uvs),Tt(e,r.positions)}destroy(){this._renderer=null}_updateCanBatch(e){const t=this._getTilingSpriteData(e),r=e.texture;let n=!0;return this._renderer.type===K.WEBGL&&(n=this._renderer.context.supports.nonPowOf2wrapping),t.canBatch=r.textureMatrix.isSimple&&(n||r.source.isPowerOfTwo),t.canBatch}}Be.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"tilingSprite"};const wt={name:"local-uniform-msdf-bit",vertex:{header:`
            struct LocalUniforms {
                uColor:vec4<f32>,
                uTransformMatrix:mat3x3<f32>,
                uDistance: f32,
                uRound:f32,
            }

            @group(2) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `},fragment:{header:`
            struct LocalUniforms {
                uColor:vec4<f32>,
                uTransformMatrix:mat3x3<f32>,
                uDistance: f32
            }

            @group(2) @binding(0) var<uniform> localUniforms : LocalUniforms;
         `,main:`
            outColor = vec4<f32>(calculateMSDFAlpha(outColor, localUniforms.uColor, localUniforms.uDistance));
        `}},St={name:"local-uniform-msdf-bit",vertex:{header:`
            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix *= uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `},fragment:{header:`
            uniform float uDistance;
         `,main:`
            outColor = vec4(calculateMSDFAlpha(outColor, vColor, uDistance));
        `}},Rt={name:"msdf-bit",fragment:{header:`
            fn calculateMSDFAlpha(msdfColor:vec4<f32>, shapeColor:vec4<f32>, distance:f32) -> f32 {

                // MSDF
                var median = msdfColor.r + msdfColor.g + msdfColor.b -
                    min(msdfColor.r, min(msdfColor.g, msdfColor.b)) -
                    max(msdfColor.r, max(msdfColor.g, msdfColor.b));

                // SDF
                median = min(median, msdfColor.a);

                var screenPxDistance = distance * (median - 0.5);
                var alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);
                if (median < 0.01) {
                    alpha = 0.0;
                } else if (median > 0.99) {
                    alpha = 1.0;
                }

                // Gamma correction for coverage-like alpha
                var luma: f32 = dot(shapeColor.rgb, vec3<f32>(0.299, 0.587, 0.114));
                var gamma: f32 = mix(1.0, 1.0 / 2.2, luma);
                var coverage: f32 = pow(shapeColor.a * alpha, gamma);

                return coverage;

            }
        `}},Ut={name:"msdf-bit",fragment:{header:`
            float calculateMSDFAlpha(vec4 msdfColor, vec4 shapeColor, float distance) {

                // MSDF
                float median = msdfColor.r + msdfColor.g + msdfColor.b -
                                min(msdfColor.r, min(msdfColor.g, msdfColor.b)) -
                                max(msdfColor.r, max(msdfColor.g, msdfColor.b));

                // SDF
                median = min(median, msdfColor.a);

                float screenPxDistance = distance * (median - 0.5);
                float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);

                if (median < 0.01) {
                    alpha = 0.0;
                } else if (median > 0.99) {
                    alpha = 1.0;
                }

                // Gamma correction for coverage-like alpha
                float luma = dot(shapeColor.rgb, vec3(0.299, 0.587, 0.114));
                float gamma = mix(1.0, 1.0 / 2.2, luma);
                float coverage = pow(shapeColor.a * alpha, gamma);

                return coverage;
            }
        `}};let I,E;class Ft extends j{constructor(e){const t=new C({uColor:{value:new Float32Array([1,1,1,1]),type:"vec4<f32>"},uTransformMatrix:{value:new T,type:"mat3x3<f32>"},uDistance:{value:4,type:"f32"},uRound:{value:0,type:"f32"}});I??(I=he({name:"sdf-shader",bits:[He,Ke(e),wt,Rt,fe]})),E??(E=pe({name:"sdf-shader",bits:[Xe,$e(e),St,Ut,me]})),super({glProgram:E,gpuProgram:I,resources:{localUniforms:t,batchSamplers:je(e)}})}}class Bt extends Je{destroy(){this.context.customShader&&this.context.customShader.destroy(),super.destroy()}}class Me{constructor(e){this._renderer=e}validateRenderable(e){const t=this._getGpuBitmapText(e);return this._renderer.renderPipes.graphics.validateRenderable(t)}addRenderable(e,t){const r=this._getGpuBitmapText(e);ue(e,r),e._didTextUpdate&&(e._didTextUpdate=!1,this._updateContext(e,r)),this._renderer.renderPipes.graphics.addRenderable(r,t),r.context.customShader&&this._updateDistanceField(e)}updateRenderable(e){const t=this._getGpuBitmapText(e);ue(e,t),this._renderer.renderPipes.graphics.updateRenderable(t),t.context.customShader&&this._updateDistanceField(e)}_updateContext(e,t){const{context:r}=t,n=qe.getFont(e.text,e._style);r.clear(),n.distanceField.type!=="none"&&(r.customShader||(r.customShader=new Ft(this._renderer.limits.maxBatchableTextures)));const s=Ne.graphemeSegmenter(e.text),a=e._style;let o=n.baseLineOffset;const u=Qe(s,a,n,!0),l=a.padding,h=u.scale;let c=u.width,d=u.height+u.offsetY;a._stroke&&(c+=a._stroke.width/h,d+=a._stroke.width/h),r.translate(-e._anchor._x*c-l,-e._anchor._y*d-l).scale(h,h);const p=n.applyFillAsTint?a._fill.color:16777215;let _=n.fontMetrics.fontSize,x=n.lineHeight;a.lineHeight&&(_=a.fontSize/h,x=a.lineHeight/h);let m=(x-_)/2;m-n.baseLineOffset<0&&(m=0);for(let y=0;y<u.lines.length;y++){const G=u.lines[y];for(let P=0;P<G.charPositions.length;P++){const Ie=G.chars[P],w=n.chars[Ie];if(w?.texture){const D=w.texture;r.texture(D,p||"black",Math.round(G.charPositions[P]+w.xOffset),Math.round(o+w.yOffset+m),D.orig.width,D.orig.height)}}o+=x}}_getGpuBitmapText(e){return e._gpuData[this._renderer.uid]||this.initGpuText(e)}initGpuText(e){const t=new Bt;return e._gpuData[this._renderer.uid]=t,this._updateContext(e,t),t}_updateDistanceField(e){const t=this._getGpuBitmapText(e).context,r=e._style.fontFamily,n=Y.get(`${r}-bitmap`),{a:s,b:a,c:o,d:u}=e.groupTransform,l=Math.sqrt(s*s+a*a),h=Math.sqrt(o*o+u*u),c=(Math.abs(l)+Math.abs(h))/2,d=n.baseRenderedFontSize/e._style.fontSize,p=c*n.distanceField.range*(1/d);t.customShader.resources.localUniforms.uniforms.uDistance=p}destroy(){this._renderer=null}}Me.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"bitmapText"};function ue(i,e){e.groupTransform=i.groupTransform,e.groupColorAlpha=i.groupColorAlpha,e.groupColor=i.groupColor,e.groupBlendMode=i.groupBlendMode,e.globalDisplayStatus=i.globalDisplayStatus,e.groupTransform=i.groupTransform,e.localDisplayStatus=i.localDisplayStatus,e.groupAlpha=i.groupAlpha,e._roundPixels=i._roundPixels}class Mt extends _e{constructor(e){super(),this.generatingTexture=!1,this.currentKey="--",this._renderer=e,e.runners.resolutionChange.add(this)}resolutionChange(){const e=this.renderable;e._autoResolution&&e.onViewUpdate()}destroy(){const{htmlText:e}=this._renderer;e.getReferenceCount(this.currentKey)===null?e.returnTexturePromise(this.texturePromise):e.decreaseReferenceCount(this.currentKey),this._renderer.runners.resolutionChange.remove(this),this.texturePromise=null,this._renderer=null}}function H(i,e){const{texture:t,bounds:r}=i,n=e._style._getFinalPadding();Ze(r,e._anchor,t);const s=e._anchor._x*n*2,a=e._anchor._y*n*2;r.minX-=n-s,r.minY-=n-a,r.maxX-=n-s,r.maxY-=n-a}class Ge{constructor(e){this._renderer=e}validateRenderable(e){const t=this._getGpuText(e),r=e.styleKey;return t.currentKey!==r}addRenderable(e,t){const r=this._getGpuText(e);if(e._didTextUpdate){const n=e._autoResolution?this._renderer.resolution:e.resolution;(r.currentKey!==e.styleKey||e.resolution!==n)&&this._updateGpuText(e).catch(s=>{console.error(s)}),e._didTextUpdate=!1,H(r,e)}this._renderer.renderPipes.batch.addToBatch(r,t)}updateRenderable(e){const t=this._getGpuText(e);t._batcher.updateElement(t)}async _updateGpuText(e){e._didTextUpdate=!1;const t=this._getGpuText(e);if(t.generatingTexture)return;const r=t.texturePromise;t.texturePromise=null,t.generatingTexture=!0,e._resolution=e._autoResolution?this._renderer.resolution:e.resolution;let n=this._renderer.htmlText.getTexturePromise(e);r&&(n=n.finally(()=>{this._renderer.htmlText.decreaseReferenceCount(t.currentKey),this._renderer.htmlText.returnTexturePromise(r)})),t.texturePromise=n,t.currentKey=e.styleKey,t.texture=await n;const s=e.renderGroup||e.parentRenderGroup;s&&(s.structureDidChange=!0),t.generatingTexture=!1,H(t,e)}_getGpuText(e){return e._gpuData[this._renderer.uid]||this.initGpuText(e)}initGpuText(e){const t=new Mt(this._renderer);return t.renderable=e,t.transform=e.groupTransform,t.texture=v.EMPTY,t.bounds={minX:0,maxX:1,minY:0,maxY:0},t.roundPixels=this._renderer._roundPixels|e._roundPixels,e._resolution=e._autoResolution?this._renderer.resolution:e.resolution,e._gpuData[this._renderer.uid]=t,t}destroy(){this._renderer=null}}Ge.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"htmlText"};function Gt(){const{userAgent:i}=X.get().getNavigator();return/^((?!chrome|android).)*safari/i.test(i)}const Dt=new de;function De(i,e,t,r){const n=Dt;n.minX=0,n.minY=0,n.maxX=i.width/r|0,n.maxY=i.height/r|0;const s=b.getOptimalTexture(n.width,n.height,r,!1);return s.source.uploadMethodId="image",s.source.resource=i,s.source.alphaMode="premultiply-alpha-on-upload",s.frame.width=e/r,s.frame.height=t/r,s.source.emit("update",s.source),s.updateUvs(),s}function At(i,e){const t=e.fontFamily,r=[],n={},s=/font-family:([^;"\s]+)/g,a=i.match(s);function o(u){n[u]||(r.push(u),n[u]=!0)}if(Array.isArray(t))for(let u=0;u<t.length;u++)o(t[u]);else o(t);a&&a.forEach(u=>{const l=u.split(":")[1].trim();o(l)});for(const u in e.tagStyles){const l=e.tagStyles[u].fontFamily;o(l)}return r}async function zt(i){const t=await(await X.get().fetch(i)).blob(),r=new FileReader;return await new Promise((s,a)=>{r.onloadend=()=>s(r.result),r.onerror=a,r.readAsDataURL(t)})}async function kt(i,e){const t=await zt(e);return`@font-face {
        font-family: "${i.fontFamily}";
        font-weight: ${i.fontWeight};
        font-style: ${i.fontStyle};
        src: url('${t}');
    }`}const O=new Map;async function It(i){const e=i.filter(t=>Y.has(`${t}-and-url`)).map(t=>{if(!O.has(t)){const{entries:r}=Y.get(`${t}-and-url`),n=[];r.forEach(s=>{const a=s.url,u=s.faces.map(l=>({weight:l.weight,style:l.style}));n.push(...u.map(l=>kt({fontWeight:l.weight,fontStyle:l.style,fontFamily:t},a)))}),O.set(t,Promise.all(n).then(s=>s.join(`
`)))}return O.get(t)});return(await Promise.all(e)).join(`
`)}function Et(i,e,t,r,n){const{domElement:s,styleElement:a,svgRoot:o}=n;s.innerHTML=`<style>${e.cssStyle}</style><div style='padding:0;'>${i}</div>`,s.setAttribute("style",`transform: scale(${t});transform-origin: top left; display: inline-block`),a.textContent=r;const{width:u,height:l}=n.image;return o.setAttribute("width",u.toString()),o.setAttribute("height",l.toString()),new XMLSerializer().serializeToString(o)}function Ot(i,e){const t=xe.getOptimalCanvasAndContext(i.width,i.height,e),{context:r}=t;return r.clearRect(0,0,i.width,i.height),r.drawImage(i,0,0),t}function Vt(i,e,t){return new Promise(async r=>{t&&await new Promise(n=>setTimeout(n,100)),i.onload=()=>{r()},i.src=`data:image/svg+xml;charset=utf8,${encodeURIComponent(e)}`,i.crossOrigin="anonymous"})}class Ae{constructor(e){this._activeTextures={},this._renderer=e,this._createCanvas=e.type===K.WEBGPU}getTexture(e){return this.getTexturePromise(e)}getManagedTexture(e){const t=e.styleKey;if(this._activeTextures[t])return this._increaseReferenceCount(t),this._activeTextures[t].promise;const r=this._buildTexturePromise(e).then(n=>(this._activeTextures[t].texture=n,n));return this._activeTextures[t]={texture:null,promise:r,usageCount:1},r}getReferenceCount(e){return this._activeTextures[e]?.usageCount??null}_increaseReferenceCount(e){this._activeTextures[e].usageCount++}decreaseReferenceCount(e){const t=this._activeTextures[e];t&&(t.usageCount--,t.usageCount===0&&(t.texture?this._cleanUp(t.texture):t.promise.then(r=>{t.texture=r,this._cleanUp(t.texture)}).catch(()=>{V("HTMLTextSystem: Failed to clean texture")}),this._activeTextures[e]=null))}getTexturePromise(e){return this._buildTexturePromise(e)}async _buildTexturePromise(e){const{text:t,style:r,resolution:n,textureStyle:s}=e,a=F.get(Ce),o=At(t,r),u=await It(o),l=it(t,r,u,a),h=Math.ceil(Math.ceil(Math.max(1,l.width)+r.padding*2)*n),c=Math.ceil(Math.ceil(Math.max(1,l.height)+r.padding*2)*n),d=a.image,p=2;d.width=(h|0)+p,d.height=(c|0)+p;const _=Et(t,r,n,u,a);await Vt(d,_,Gt()&&o.length>0);const x=d;let m;this._createCanvas&&(m=Ot(d,n));const y=De(m?m.canvas:x,d.width-p,d.height-p,n);return s&&(y.source.style=s),this._createCanvas&&(this._renderer.texture.initSource(y.source),xe.returnCanvasAndContext(m)),F.return(a),y}returnTexturePromise(e){e.then(t=>{this._cleanUp(t)}).catch(()=>{V("HTMLTextSystem: Failed to clean texture")})}_cleanUp(e){b.returnTexture(e,!0),e.source.resource=null,e.source.uploadMethodId="unknown"}destroy(){this._renderer=null;for(const e in this._activeTextures)this._activeTextures[e]&&this.returnTexturePromise(this._activeTextures[e].promise);this._activeTextures=null}}Ae.extension={type:[f.WebGLSystem,f.WebGPUSystem,f.CanvasSystem],name:"htmlText"};class Lt extends _e{constructor(e){super(),this._renderer=e,e.runners.resolutionChange.add(this)}resolutionChange(){const e=this.renderable;e._autoResolution&&e.onViewUpdate()}destroy(){const{canvasText:e}=this._renderer;e.getReferenceCount(this.currentKey)>0?e.decreaseReferenceCount(this.currentKey):this.texture&&e.returnTexture(this.texture),this._renderer.runners.resolutionChange.remove(this),this._renderer=null}}class ze{constructor(e){this._renderer=e}validateRenderable(e){const t=this._getGpuText(e),r=e.styleKey;return t.currentKey!==r?!0:e._didTextUpdate}addRenderable(e,t){const r=this._getGpuText(e);if(e._didTextUpdate){const n=e._autoResolution?this._renderer.resolution:e.resolution;(r.currentKey!==e.styleKey||e.resolution!==n)&&this._updateGpuText(e),e._didTextUpdate=!1}this._renderer.renderPipes.batch.addToBatch(r,t)}updateRenderable(e){const t=this._getGpuText(e);t._batcher.updateElement(t)}_updateGpuText(e){const t=this._getGpuText(e);t.texture&&this._renderer.canvasText.decreaseReferenceCount(t.currentKey),e._resolution=e._autoResolution?this._renderer.resolution:e.resolution,t.texture=this._renderer.canvasText.getManagedTexture(e),t.currentKey=e.styleKey,H(t,e)}_getGpuText(e){return e._gpuData[this._renderer.uid]||this.initGpuText(e)}initGpuText(e){const t=new Lt(this._renderer);return t.currentKey="--",t.renderable=e,t.transform=e.groupTransform,t.bounds={minX:0,maxX:1,minY:0,maxY:0},t.roundPixels=this._renderer._roundPixels|e._roundPixels,e._gpuData[this._renderer.uid]=t,t}destroy(){this._renderer=null}}ze.extension={type:[f.WebGLPipes,f.WebGPUPipes,f.CanvasPipes],name:"text"};class ke{constructor(e){this._activeTextures={},this._renderer=e}getTexture(e,t,r,n){typeof e=="string"&&(J("8.0.0","CanvasTextSystem.getTexture: Use object TextOptions instead of separate arguments"),e={text:e,style:r,resolution:t}),e.style instanceof Z||(e.style=new Z(e.style)),e.textureStyle instanceof W||(e.textureStyle=new W(e.textureStyle)),typeof e.text!="string"&&(e.text=e.text.toString());const{text:s,style:a,textureStyle:o}=e,u=e.resolution??this._renderer.resolution,{frame:l,canvasAndContext:h}=A.getCanvasAndContext({text:s,style:a,resolution:u}),c=De(h.canvas,l.width,l.height,u);if(o&&(c.source.style=o),a.trim&&(l.pad(a.padding),c.frame.copyFrom(l),c.frame.scale(1/u),c.updateUvs()),a.filters){const d=this._applyFilters(c,a.filters);return this.returnTexture(c),A.returnCanvasAndContext(h),d}return this._renderer.texture.initSource(c._source),A.returnCanvasAndContext(h),c}returnTexture(e){const t=e.source;t.resource=null,t.uploadMethodId="unknown",t.alphaMode="no-premultiply-alpha",b.returnTexture(e,!0)}renderTextToCanvas(){J("8.10.0","CanvasTextSystem.renderTextToCanvas: no longer supported, use CanvasTextSystem.getTexture instead")}getManagedTexture(e){e._resolution=e._autoResolution?this._renderer.resolution:e.resolution;const t=e.styleKey;if(this._activeTextures[t])return this._increaseReferenceCount(t),this._activeTextures[t].texture;const r=this.getTexture({text:e.text,style:e.style,resolution:e._resolution,textureStyle:e.textureStyle});return this._activeTextures[t]={texture:r,usageCount:1},r}decreaseReferenceCount(e){const t=this._activeTextures[e];t.usageCount--,t.usageCount===0&&(this.returnTexture(t.texture),this._activeTextures[e]=null)}getReferenceCount(e){return this._activeTextures[e]?.usageCount??0}_increaseReferenceCount(e){this._activeTextures[e].usageCount++}_applyFilters(e,t){const r=this._renderer.renderTarget.renderTarget,n=this._renderer.filter.generateFilteredTexture({texture:e,filters:t});return this._renderer.renderTarget.bind(r,!1),n}destroy(){this._renderer=null;for(const e in this._activeTextures)this._activeTextures[e]&&this.returnTexture(this._activeTextures[e].texture);this._activeTextures=null}}ke.extension={type:[f.WebGLSystem,f.WebGPUSystem,f.CanvasSystem],name:"canvasText"};g.add(ye);g.add(be);g.add(Pe);g.add(et);g.add(we);g.add(Re);g.add(Ue);g.add(ke);g.add(ze);g.add(Me);g.add(Ae);g.add(Ge);g.add(Be);g.add(Fe);g.add(ve);g.add(Te);
