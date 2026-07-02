document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. Hero WebGL Shimmer Shader
    // -------------------------------------------------------------
    const heroCanvas = document.getElementById('shader-canvas-ANIMATION_7');
    if (heroCanvas) {
        initShader(heroCanvas);
    }

    // -------------------------------------------------------------
    // 2. Footer WebGL Shimmer Shader
    // -------------------------------------------------------------
    const footerCanvas = document.getElementById('shader-canvas-footer-ANIMATION_7');
    if (footerCanvas) {
        initShader(footerCanvas);
    }

    // Generic WebGL Shader initialization function
    function initShader(canvas) {
        function syncSize() {
            const w = canvas.clientWidth || 1280;
            const h = canvas.clientHeight || 720;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        }
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(syncSize).observe(canvas);
        }
        syncSize();

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;

        const vs = `attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          v_texCoord = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }`;

        const fs = `precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform vec2 u_resolution;

        void main() {
            vec2 uv = v_texCoord;
            float noise = sin(uv.x * 10.0 + u_time * 0.5) * cos(uv.y * 10.0 + u_time * 0.3);
            float shimmer = smoothstep(0.4, 0.6, sin(uv.x * 2.0 + uv.y * 2.0 + u_time * 0.8) * 0.5 + 0.5);
            vec3 gold = vec3(0.83, 0.69, 0.22);
            vec3 background = vec3(0.06, 0.06, 0.06);
            vec3 finalColor = mix(background, gold, shimmer * 0.1);
            finalColor += gold * (shimmer * 0.05);
            gl_FragColor = vec4(finalColor, 1.0);
        }`;

        function cs(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const pos = gl.getAttribLocation(prog, 'a_position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(prog, 'u_time');
        const uRes = gl.getUniformLocation(prog, 'u_resolution');
        const uMouse = gl.getUniformLocation(prog, 'u_mouse');

        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        window.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width && rect.height) {
                const nx = (event.clientX - rect.left) / rect.width;
                const ny = 1.0 - (event.clientY - rect.top) / rect.height;
                mouse.x = nx * canvas.width;
                mouse.y = ny * canvas.height;
            }
        });

        function render(t) {
            if (typeof ResizeObserver === 'undefined') syncSize();
            gl.viewport(0, 0, canvas.width, canvas.height);
            if (uTime) gl.uniform1f(uTime, t * 0.001);
            if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
            if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        }
        render(0);
    }

    // -------------------------------------------------------------
    // 3. Reveal on Scroll (Intersection Observer)
    // -------------------------------------------------------------
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.querySelectorAll('.counter').length > 0) {
                    startCounters(entry.target);
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // -------------------------------------------------------------
    // 4. Number Counters Animation
    // -------------------------------------------------------------
    function startCounters(container) {
        container.querySelectorAll('.counter').forEach(counter => {
            if (counter.classList.contains('started')) return;
            counter.classList.add('started');
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const count = +counter.innerText.replace(/[^0-9]/g, '');
                const speed = Math.max(1, Math.ceil(target / 100));
                if (count < target) {
                    counter.innerText = Math.min(target, count + speed);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target + (target === 95 ? '%' : target === 1500 ? '+' : '+');
                }
            };
            updateCount();
        });
    }

    // -------------------------------------------------------------
    // 5. Active State Navigation Logic
    // -------------------------------------------------------------
    window.addEventListener('scroll', () => {
        const sections = ['about', 'services', 'why-us', 'testimonials', 'contact'];
        let current = '';
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element && window.scrollY >= element.offsetTop - 150) {
                current = section;
            }
        });

        document.querySelectorAll('nav a').forEach(a => {
            a.classList.remove('text-secondary-fixed', 'font-bold', 'border-b-2', 'border-secondary-fixed', 'pb-1');
            a.classList.add('text-on-primary/80');
            if (a.getAttribute('href').includes(current)) {
                a.classList.remove('text-on-primary/80');
                a.classList.add('text-secondary-fixed', 'font-bold', 'border-b-2', 'border-secondary-fixed', 'pb-1');
            }
        });
    });

    // 
    const upBtn = document.querySelector('.up-btn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            upBtn.classList.add('visible');
        } else {
            upBtn.classList.remove('visible');
        }
    });

    // Up Button Animation
    upBtn.addEventListener('click', () => {
        console.log('Up button clicked');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
