/**
 * Liquid Glass — iOS-style WebGL effect
 * Lens refraction + multi-sample blur + specular highlight + chromatic dispersion.
 * Based on Apple's Liquid Glass: a convex-lens distortion of the background,
 * frosted blur, bright specular highlight at top, subtle edge rim, and
 * per-channel UV offset for real dispersion.
 */
(function () {
  'use strict';

  if (window.innerWidth <= 1200) return;

  var section   = document.querySelector('[data-section-id="key-ingredients"]');
  if (!section) return;
  var container = section.querySelector('.key-ingredients__container');
  var bgEl      = section.querySelector('.key-ingredients__bg');
  var bgImg     = section.querySelector('.key-ingredients__bg img');
  var cardEls   = section.querySelectorAll('.key-ingredients__card');
  if (!container || !bgImg || !cardEls.length) return;

  /* ─── shaders ─── */

  var VERT = [
    'attribute vec2 a;',
    'varying vec2 v;',
    'void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}'
  ].join('\n');

  // iOS-style liquid glass fragment shader
  var FRAG = [
    'precision highp float;',
    'varying vec2 v;',
    'uniform sampler2D tex;',
    'uniform vec2 cPos;',       // card top-left in container 0→1
    'uniform vec2 cSz;',        // card size   in container 0→1
    'uniform vec2 bgOff;',      // bg parallax offset
    'uniform float bgImgH;',    // bg image height ratio (2.6)
    'uniform float t;',         // time (seconds)
    'uniform float seed;',
    'uniform vec2 res;',        // canvas pixel size

    'void main(){',

    // ── Map card UV → background texture UV ──
    '  vec2 bgUV;',
    '  bgUV.x = cPos.x + v.x * cSz.x;',
    '  float cardY = cPos.y + (1.-v.y) * cSz.y;',
    '  bgUV.y = (cardY - bgOff.y) / bgImgH + (1.-1./bgImgH);',

    // ── Flat glass (no lens magnification) ──
    '  vec2 ctr = v - .5;',
    '  float aspect = res.x / res.y;',
    '  float dist = length(vec2(ctr.x * aspect, ctr.y));',
    '  vec2 lensUV = bgUV;',

    // ── Chromatic dispersion (per-channel UV offset) ──
    '  vec2 dir = normalize(ctr + 1e-4);',
    '  float dispStr = .004 * (1. + dist * 3.);',
    '  vec2 rOff =  dir * dispStr * cSz;',
    '  vec2 bOff = -dir * dispStr * cSz;',

    // ── Multi-sample blur (5×5 box, per-channel for dispersion) ──
    '  vec3 col = vec3(0.);',
    '  float total = 0.;',
    '  float blur = 1.8 / min(res.x, res.y);',
    '  for(float x=-2.;x<=2.;x+=1.){',
    '    for(float y=-2.;y<=2.;y+=1.){',
    '      vec2 off = vec2(x,y) * blur * cSz;',
    '      col.r += texture2D(tex, clamp(lensUV + rOff + off, 0., 1.)).r;',
    '      col.g += texture2D(tex, clamp(lensUV       + off, 0., 1.)).g;',
    '      col.b += texture2D(tex, clamp(lensUV + bOff + off, 0., 1.)).b;',
    '      total += 1.;',
    '    }',
    '  }',
    '  col /= total;',

    // ── Specular highlight (top of glass, simulates light on curved surface) ──
    // Bright band near top, fading with a soft edge, narrower at sides
    '  float specY = smoothstep(.25, .85, v.y);',                  // v.y=1 is top
    '  float specX = 1. - pow(abs(ctr.x) * 2.2, 2.);',            // narrower at edges
    '  specX = max(specX, 0.);',
    '  float spec = specY * specX * .35;',
    // Add a small sharp highlight line near top
    '  float sharpLine = smoothstep(.78, .82, v.y) * smoothstep(.88, .84, v.y);',
    '  sharpLine *= (1. - pow(abs(ctr.x) * 2.5, 3.));',
    '  spec += max(sharpLine, 0.) * .25;',

    // ── Edge rim glow (light wrapping around glass edges) ──
    '  float eX = smoothstep(0., .06, min(v.x, 1.-v.x));',
    '  float eY = smoothstep(0., .06, min(v.y, 1.-v.y));',
    '  float rim = (1. - eX * eY) * .12;',

    // ── Bottom inner shadow (depth cue) ──
    '  float shadow = smoothstep(.25, 0., v.y) * .08;',

    // ── Compose final color ──
    '  vec3 fc = col;',
    '  fc += spec;',            // specular highlight
    '  fc += rim;',             // edge glow
    '  fc -= shadow;',          // bottom shadow
    '  fc *= 1.04;',            // slight brightness (glass refracts light inward)

    '  gl_FragColor = vec4(clamp(fc, 0., 1.), .82);',
    '}'
  ].join('\n');

  /* ─── GL helpers ─── */

  function mkShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('liquid-glass shader:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function mkProgram(gl) {
    var vs = mkShader(gl, gl.VERTEX_SHADER, VERT);
    var fs = mkShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('liquid-glass program:', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  /* ─── init ─── */

  function init() {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { setup(img); };
    img.onerror = function () { console.warn('liquid-glass: bg load failed'); };
    img.src = bgImg.src;
  }

  function setup(img) {
    var instances = [];

    cardEls.forEach(function (card, idx) {
      var canvas = document.createElement('canvas');
      canvas.className = 'key-ingredients__glass-canvas';
      card.insertBefore(canvas, card.firstChild);

      var gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false
      });
      if (!gl) return;

      var prog = mkProgram(gl);
      if (!prog) return;

      // Quad
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

      // Texture
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      instances.push({
        card: card,
        canvas: canvas,
        gl: gl,
        prog: prog,
        buf: buf,
        tex: tex,
        aPos: gl.getAttribLocation(prog, 'a'),
        u: {
          tex:    gl.getUniformLocation(prog, 'tex'),
          cPos:   gl.getUniformLocation(prog, 'cPos'),
          cSz:    gl.getUniformLocation(prog, 'cSz'),
          bgOff:  gl.getUniformLocation(prog, 'bgOff'),
          bgImgH: gl.getUniformLocation(prog, 'bgImgH'),
          t:      gl.getUniformLocation(prog, 't'),
          seed:   gl.getUniformLocation(prog, 'seed'),
          res:    gl.getUniformLocation(prog, 'res')
        },
        seed: idx * 1.7 + 0.5
      });
    });

    if (!instances.length) return;
    section.classList.add('key-ingredients--webgl');

    var t0 = performance.now();
    var raf;

    function render() {
      var cRect = container.getBoundingClientRect();
      var bRect = bgEl.getBoundingClientRect();
      var time  = (performance.now() - t0) / 1000;
      var bgImgH = 2.6;
      var bgOffY = (bRect.top - cRect.top) / cRect.height;

      for (var i = 0; i < instances.length; i++) {
        var inst   = instances[i];
        var card   = inst.card;
        var gl     = inst.gl;
        var canvas = inst.canvas;

        var cw  = card.offsetWidth;
        var ch  = card.offsetHeight;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var pw  = Math.round(cw * dpr);
        var ph  = Math.round(ch * dpr);
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width  = pw;
          canvas.height = ph;
        }

        gl.viewport(0, 0, pw, ph);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(inst.prog);

        var cr  = card.getBoundingClientRect();
        var cpx = (cr.left - cRect.left) / cRect.width;
        var cpy = (cr.top  - cRect.top)  / cRect.height;
        var csx = cr.width  / cRect.width;
        var csy = cr.height / cRect.height;

        gl.uniform2f(inst.u.cPos,   cpx, cpy);
        gl.uniform2f(inst.u.cSz,    csx, csy);
        gl.uniform2f(inst.u.bgOff,  0, bgOffY);
        gl.uniform1f(inst.u.bgImgH, bgImgH);
        gl.uniform1f(inst.u.t,      time);
        gl.uniform1f(inst.u.seed,   inst.seed);
        gl.uniform2f(inst.u.res,    pw, ph);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inst.tex);
        gl.uniform1i(inst.u.tex, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, inst.buf);
        gl.enableVertexAttribArray(inst.aPos);
        gl.vertexAttribPointer(inst.aPos, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(render);
    }

    render();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); }
      else { render(); }
    });
  }

  if (bgImg.complete && bgImg.naturalWidth > 0) init();
  else bgImg.addEventListener('load', init);
})();
