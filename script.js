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

    // -------------------------------------------------------------
    // 6. About Section Tabs Switching
    // -------------------------------------------------------------
    const aboutTabs = document.querySelectorAll('#about-tabs button');
    const aboutPanes = document.querySelectorAll('#about-panes .tab-pane');

    aboutTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes from all tabs
            aboutTabs.forEach(t => {
                t.classList.remove('border-secondary-fixed', 'gold-text');
                t.classList.add('border-transparent', 'text-on-surface-variant');
                t.setAttribute('aria-selected', 'false');
            });
            // Add active classes to current tab
            tab.classList.remove('border-transparent', 'text-on-surface-variant');
            tab.classList.add('border-secondary-fixed', 'gold-text');
            tab.setAttribute('aria-selected', 'true');

            const targetPaneId = tab.getAttribute('aria-controls');
            aboutPanes.forEach(pane => {
                if (pane.id === targetPaneId) {
                    pane.classList.remove('hidden');
                    pane.classList.add('block');
                    // Add fade animation
                    setTimeout(() => {
                        pane.classList.remove('opacity-0');
                        pane.classList.add('opacity-100');
                    }, 50);
                } else {
                    pane.classList.remove('block', 'opacity-100');
                    pane.classList.add('hidden', 'opacity-0');
                }
            });
        });
    });

    // -------------------------------------------------------------
    // 7. Services Modal System & Data
    // -------------------------------------------------------------
    const servicesData = [
        {
            title: "حوكمة الشركات",
            icon: "admin_panel_settings",
            html: `
                <p class="mb-4 text-on-primary/80">يقدم مكتب الأصيل للمحاماة أفضل الخدمات القانونية ذات الصلة بحوكمة الشركات تحت إشراف أفضل المحامين المحترفين الذين يقدمون خلاصة خبراتهم المهنية في هذا المجال.</p>
                <p class="mb-2 font-bold gold-text">تؤدي حوكمة الشركات بصورة إيجابية إلى دفع أعمالك نحو النجاح، ومن أهم خدماتها:</p>
                <ul class="list-decimal list-inside space-y-2 text-on-primary/70">
                    <li>تمكنك من التحكم في حجم المخاطر التي قد تتعرض لها.</li>
                    <li>تبسيط الإجراءات داخل الشركة وتنظيمها.</li>
                    <li>توفر الاستخدام الأمثل لأصول الشركة وتمنع الهدر.</li>
                    <li>تحدد المسئوليات والحقوق لكل من أصحاب المصالح داخل الشركات وفقاً لأدوارهم.</li>
                    <li>توفر للمساهمين الشعور بالأمان والطمأنينة على استثماراتهم داخل الشركة.</li>
                    <li>تحقق الشفافية في عرض كل المعلومات والقرارات الهامة بالشركة.</li>
                    <li>تحرص على حماية أسهم المساهمين، وحصولهم على تعويضات إذا انتهكت حقوقهم.</li>
                    <li>توضح مسؤوليات مجلس إدارة الشركة في الإشراف على الأداء وتجيب على استجوابات المساهمين.</li>
                </ul>
            `
        },
        {
            title: "صياغة العقود",
            icon: "history_edu",
            html: `
                <p class="mb-4 text-on-primary/80">يقدم مكتب الأصيل للمحاماة خدماته الاحترافية في مجال صياغة العقود ومراجعتها باللغتين العربية والإنجليزية لتأمين تعاملاتكم وحفظ حقوقكم.</p>
                <p class="mb-2 font-bold gold-text">مميزات خدماتنا في صياغة العقود ومراجعتها:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>تتم تحت إشراف نخبة من أفضل المحامين لتجنب الوقوع في أخطاء قانونية قد تكلفك الكثير لاحقاً.</li>
                    <li>توفير أفضل وثيقة قانونية رسمية ومحكمة لكل المعاملات التجارية والمدنية.</li>
                    <li>تقديم بنود مفصلة وملزمة لكافة الأطراف لحماية حقوق العملاء ومصالحهم.</li>
                    <li>مراجعة دقيقة للعقود لتجنب الوقوع في الثغرات القانونية أثناء الصياغة.</li>
                    <li>مهارة فائقة في اختيار الألفاظ القانونية التي تجنبك الدخول في أي نزاعات مستقبلية.</li>
                    <li>توضيح مفصل للواجبات والالتزامات مع التأكد من تطابق الشروط مع نوايا الأطراف.</li>
                    <li>إضافة شروط وأحكام تحمي مصالحك وتعمل لصالحك قد تكون غافلاً عنها.</li>
                    <li>حرص تام على توافق العقد مع القوانين المعمول بها لضمان سريانه ونفاذه في حالة النزاع.</li>
                </ul>
            `
        },
        {
            title: "عمليات الاندماج والاستحواذ",
            icon: "handshake",
            html: `
                <p class="mb-4 text-on-primary/80">نقدم خدماتنا القانونية المتخصصة في مكتب الأصيل للمحاماة لعملائنا الراغبين في اختيار استراتيجية الاندماج والاستحواذ للتوسع في أنشطتهم التجارية وتحقيق النجاح.</p>
                <p class="mb-2 font-bold gold-text">كيف نساعدك في صفقات الاندماج والاستحواذ:</p>
                <ul class="list-decimal list-inside space-y-2 text-on-primary/70">
                    <li>صياغة ومراجعة عقود الدمج والاستحواذ بدقة متناهية.</li>
                    <li>تحليل وتفصيل قرارات الاندماج والاستحواذ الاستراتيجية وتقييم البدائل.</li>
                    <li>تقديم خدمات التدقيق والتقصي القانوني النافي للجهالة (Due Diligence).</li>
                    <li>تنفيذ اتفاقيات نقل الأسهم وإعادة تنظيم وهيكلة الشركات.</li>
                    <li>الإعداد والتحضير القانوني الكامل لكافة الصفقات التجارية.</li>
                    <li>استخراج وتقديم كافة الموافقات والتراخيص من الجهات الرسمية المختصة.</li>
                    <li>استشارات قانونية في تنظيم الامتثال، وحقوق الملكية، والديون للشركات العامة والخاصة.</li>
                    <li>إغلاق الصفقات وإتمام عمليات بيع الأسهم والأصول بكفاءة.</li>
                    <li>دعم العملاء في الخدمات ذات الصلة كالتوظيف والمنافسة والملكية الفكرية وحماية البيانات.</li>
                </ul>
            `
        },
        {
            title: "العقارات",
            icon: "domain",
            html: `
                <p class="mb-4 text-on-primary/80">نقدم لموكلينا في القطاع العقاري أفضل الحلول والاستشارات القانونية التي تساعدهم على تحسين أداء شركاتهم العقارية ونمو استثماراتهم وأصولهم بأمان.</p>
                <p class="mb-2 font-bold gold-text">الخدمات الاستشارية والتنفيذية التي نقدمها:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>استشارات قانونية لشركات التطوير العقاري في عمليات الشراء والبيع والامتلاك والاستئجار.</li>
                    <li>تقديم الحلول القانونية للتعامل مع الممتلكات وحل النزاعات العقارية بين الأطراف.</li>
                    <li>إعداد ومراجعة صيغ العقود العقارية لضمان خلوها من الثغرات وحفظ حقوق جميع الأطراف.</li>
                    <li>إعداد عقود المقاولات والإنشاءات وتقسيم الملكية العقارية.</li>
                    <li>استخراج تراخيص البناء والتشغيل والتنسيق مع الجهات الإدارية.</li>
                    <li>تنظيم وصياغة التعاقدات والاتفاقيات بين المقاولين والملاك لضمان التنفيذ.</li>
                    <li>صياغة عقود استئجار وتوريد معدات المقاولات والآلات.</li>
                    <li>حل النزاعات المتعلقة بمشاريع البناء المتعثرة والمشكلات بين العملاء والمطورين.</li>
                    <li>تنفيذ كافة المعاملات القانونية اللازمة أمام الجهات ومصلحة الشهر العقاري.</li>
                </ul>
            `
        },
        {
            title: "قانون العمل",
            icon: "badge",
            html: `
                <p class="mb-4 text-on-primary/80">نوفر في مكتب الأصيل للمحاماة فريقاً من المحامين المتخصصين في تقديم الخدمات القانونية الخاصة بقانون العمل والتوظيف وحماية بيئة العمل.</p>
                <p class="mb-2 font-bold gold-text">وتشمل خدماتنا في قانون العمل:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>تقديم التوجيه الصحيح والاستشارات للشركات في كافة مسائل العمالة والتوظيف الفردي والجماعي.</li>
                    <li>صياغة عقود العمل والتوظيف ولوائح العمل الداخلية للشركات وتدقيقها.</li>
                    <li>تسوية النزاعات العمالية الودية والقضائية، وحالات إنهاء الخدمة غير القانونية والفصل التعسفي.</li>
                    <li>تولي القضايا المتعلقة بإصابات العمل والتعويضات والتأمين الاجتماعي للعمال.</li>
                    <li>تولي الدعاوى الجنائية الخاصة بالاختلاس والسرقة والتزوير وإفشاء الأسرار في بيئة العمل.</li>
                    <li>تقديم استشارات لوضع خطط التوظيف وتدريب الكوادر البشرية وتحديد سياسات الأجور والمكافآت.</li>
                </ul>
            `
        },
        {
            title: "قانون الهجرة والجنسية",
            icon: "public",
            html: `
                <p class="mb-4 text-on-primary/80">نغطي في مكتب الأصيل للمحاماة باقة واسعة من خدمات الهجرة والجنسية بدءاً من صياغة اتفاقيات المساعدة وحتى الاستشارات ومراقبة المخاطر.</p>
                <p class="mb-2 font-bold gold-text">الخدمات التي نقدمها للأفراد والشركات:</p>
                <ul class="list-decimal list-inside space-y-2 text-on-primary/70">
                    <li>توفير المساعدات اللازمة لإتمام عمليات الهجرة وإعداد الأوراق بدقة لتفادي الرفض.</li>
                    <li>تولي الإجراءات القانونية للشركات الراغبة في استقدام وتوظيف موظفين وخبراء أجانب.</li>
                    <li>الدفاع عن المهاجرين في القضايا والاتهامات الجنائية والإدارية التي قد تؤدي إلى ترحيلهم.</li>
                    <li>تقديم طلبات الحصول على التأشيرات بمختلف أنواعها (للموظفين، السياح، الطلاب، والمستثمرين).</li>
                    <li>تقديم استشارات متكاملة للعملاء الراغبين في الحصول على الجنسية أو الإقامة الدائمة بأسرع الطرق القانونية.</li>
                </ul>
            `
        },
        {
            title: "قانون التأمين وإعادة التأمين",
            icon: "security",
            html: `
                <p class="mb-4 text-on-primary/80">يقدم مكتبنا الخدمات القانونية الشاملة في مجال قانون التأمين وإعادة التأمين وفقاً للمتطلبات التنظيمية والتجارية لكافة الفئات والأطراف.</p>
                <p class="mb-2 font-bold gold-text">من أهم خدماتنا في قطاع التأمين:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>استشارات قانونية حول مختلف فئات التأمين (التأمين ضد الإصابة، حوادث السيارات، تأمين الممتلكات والمشاريع).</li>
                    <li>تقديم الدعم القانوني والتنظيمي لإنشاء وتأسيس شركات التأمين وإعادة التأمين.</li>
                    <li>استشارات حول الالتزامات العامة والتأمين الصحي وتعويضات العمال والمسؤولية المهنية.</li>
                    <li>تقديم النصائح القانونية حول التغطية التأمينية المناسبة للشركات والمؤسسات والأفراد.</li>
                    <li>تمثيل العملاء في قضايا نزاعات التأمين والمطالبات وحل الخلافات ودياً أو قضائياً.</li>
                    <li>فض النزاعات حول مبالغ التعويض التأميني والتفاوض مع شركات التأمين لضمان السداد.</li>
                </ul>
            `
        },
        {
            title: "ترخيص الاستثمار الأجنبي",
            icon: "trending_up",
            html: `
                <p class="mb-4 text-on-primary/80">نقدم خدمات قانونية متكاملة لدعم وتوجيه المستثمرين الأجانب لتأسيس وبدء أعمالهم الاستثمارية بنجاح وأمان تام.</p>
                <p class="mb-2 font-bold gold-text">وتشمل خدمات ترخيص الاستثمار الأجنبي:</p>
                <ul class="list-decimal list-inside space-y-2 text-on-primary/70">
                    <li>تقديم الدعم والتوجيه القانوني الشامل خلال كافة مراحل تأسيس الشركات الأجنبية.</li>
                    <li>إصدار وتعديل وتجديد تراخيص ممارسة الاستثمار الأجنبي من الجهات المختصة.</li>
                    <li>تقديم الاستشارات القانونية المتعلقة بأنظمة وقوانين الاستثمار الأجنبي والمزايا والضمانات.</li>
                    <li>صياغة ومراجعة كافة الاتفاقيات التجارية وعقود الشراكة بين المستثمر الأجنبي والشركاء المحليين.</li>
                    <li>صياغة وإصدار قرارات بيع وتملك العقارات لمنشآت الاستثمار الأجنبي وفق الضوابط المعمول بها.</li>
                </ul>
            `
        },
        {
            title: "إعادة الهيكلة",
            icon: "schema",
            html: `
                <p class="mb-4 text-on-primary/80">نقدم في مكتب الأصيل المساعدة القانونية للشركات للتغلب على الصعوبات الاقتصادية والمالية التي تواجهها، أو عند تعرضها لخطر الإعسار الوشيك.</p>
                <p class="mb-2 font-bold gold-text">آلية عملنا في إعادة الهيكلة:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>التدخل السريع بوفد قانوني لإجراء المفاوضات مع الدائنين ومسؤول الإعسار للتوصل لحلول مرضية.</li>
                    <li>صياغة وعقد اتفاقيات إعادة الجدولة التي تضمن استرداد الشركات وموافقة المحكمة اللاحقة عليها.</li>
                    <li>توفير أفضل الحلول القانونية والمالية والفنية لدعم وتنشيط الشركات الصغيرة والمتوسطة.</li>
                    <li>إعادة هيكلة الديون والالتزامات وحماية أصول الشركة من التصفية القسرية.</li>
                </ul>
            `
        },
        {
            title: "التحكيم وفض المنازعات",
            icon: "scale",
            html: `
                <p class="mb-4 text-on-primary/80">يوفر مكتب الأصيل للمحاماة خدمات قانونية متميزة في مجالات التحكيم وفض المنازعات محلياً ودولياً كبديل سريع وفعال للقضاء التقليدي.</p>
                <p class="mb-2 font-bold gold-text">أبرز خدماتنا في التحكيم وتسوية المنازعات:</p>
                <ul class="list-decimal list-inside space-y-2 text-on-primary/70">
                    <li>التمثيل والترافع في قضايا التحكيم التجاري، والمدني، والإداري، والعمالي أمام الهيئات واللجان.</li>
                    <li>مساعدة العملاء في استرداد الحقوق والائتمانات غير المدفوعة ودياً وتسوية الخلافات قبل الوصول للتقاضي.</li>
                    <li>متابعة تنفيذ اتفاقيات الدفع والتسويات الودية مع العملاء لضمان الالتزام.</li>
                    <li>تقديم حلول مبتكرة وبديلة لتسوية المنازعات التجارية المعقدة.</li>
                    <li>تمثيل العملاء باحترافية في عمليات التوفيق والوساطة لتقريب وجهات النظر.</li>
                </ul>
            `
        },
        {
            title: "الخدمات المصرفية والمالية",
            icon: "payments",
            html: `
                <p class="mb-4 text-on-primary/80">ندعم في مكتب الأصيل عملاءنا من خلال مساعدتهم في كافة العمليات المصرفية والمالية وتجنب المخاطر الائتمانية والتمويلية.</p>
                <p class="mb-2 font-bold gold-text">أهم الخدمات المصرفية والمالية التي نقدمها:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>تقديم خدمات إعادة هيكلة المتطلبات المصرفية، التمويل المنظم وتوفير الضمانات والائتمان العقاري.</li>
                    <li>مساعدة الشركات والمؤسسات في هيكلة وتجميع عمليات الائتمان (القروض المشتركة والتمويلات).</li>
                    <li>تقديم الخدمات الاستشارية في إعادة هيكلة الديون المتعثرة وتمويل المشاريع الكبرى.</li>
                    <li>تمثيل الشركات الكبرى والمؤسسات المالية في المعاملات المالية الوطنية والدولية.</li>
                </ul>
            `
        },
        {
            title: "التمويل الإسلامي",
            icon: "account_balance",
            html: `
                <p class="mb-4 text-on-primary/80">اكتسب مكتب الأصيل للمحاماة تميزاً مهنياً كبيراً في قطاع التمويل الإسلامي من خلال ممارسات عملية طويلة في هيكلة صيغ التمويل للشركات والبنوك بما يتوافق مع الشريعة.</p>
                <p class="mb-2 font-bold gold-text">تفاصيل خدماتنا في التمويل الإسلامي:</p>
                <ul class="list-decimal list-inside space-y-2 text-on-primary/70">
                    <li>هيكلة وصياغة منتجات التمويل المتوافقة مع أحكام الشريعة الإسلامية (مرابحة، مشاركة، مضاربة، إجارة، صكوك).</li>
                    <li>تحليل ومقارنة الصيغ التقليدية وصيغ التمويل الإسلامي لتوضيح المزايا والعيوب ومعرفة المخاطر القانونية والشرعية وتجنبها.</li>
                    <li>توفير أدلة إجرائية ومستندية متكاملة لتوضيح مراحل تنفيذ المنتج والدورة المستندية وتفادي الإشكاليات.</li>
                    <li>تقديم حلول شرعية وقانونية مبتكرة لحل المشاكل مع العملاء في المؤسسات المالية الإسلامية.</li>
                    <li>تقديم الاستشارات القانونية حول تطبيق أحكام أنظمة التمويل في المخالفات والمنازعات ودعاوى الحق العام والخاص.</li>
                    <li>الترافع والتمثيل أمام لجنة المنازعات المصرفية ولجنة الفصل في المخالفات والنزاعات التمويلية.</li>
                </ul>
            `
        },
        {
            title: "الملكية الفكرية",
            icon: "copyright",
            html: `
                <p class="mb-4 text-on-primary/80">يضم مكتب الأصيل محامين متخصصين يملكون خبرة عريضة في حماية الملكية الفكرية والامتياز التجاري للعملاء محلياً ودولياً.</p>
                <p class="mb-2 font-bold gold-text">مجالات وخدمات الملكية الفكرية:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>تمثيل الكثير من العلامات التجارية الشهيرة في قضايا التعدي وحقوق الملكية الفكرية.</li>
                    <li>تولي آلاف القضايا الخاصة ببراءات الاختراع، وحماية حقوق التأليف والنشر، والأسماء التجارية، وأسماء النطاقات.</li>
                    <li>تأدية كافة المهام القانونية لصياغة اتفاقيات الامتياز (Franchise) والتراخيص ومكافحة التزييف والتقليد.</li>
                    <li>تقديم استشارات حول استراتيجيات حماية أسماء النطاقات ومدى توافر العلامات التجارية وسهولة تسجيلها.</li>
                    <li>تقديم استشارات قانونية لحفظ وتأمين العلامات التجارية وحقوق الطبع والتأليف.</li>
                    <li>مكافحة تزييف المبيعات على المستوى المحلي والدولي، وتخفيض مخاطر الانتهاكات المحتملة للعلامات والأصول الفكرية للشركات.</li>
                </ul>
            `
        },
        {
            title: "الدعاوى العامة والمعقدة",
            icon: "gavel",
            html: `
                <p class="mb-4 text-on-primary/80">يتمتع مكتب الأصيل للمحاماة بخبرة كبيرة في تمثيل الموكلين (مدعين ومدعى عليهم) أمام القضاء، سواء كانوا أفراداً أو مؤسسات تجارية في الدعاوى العامة والمعقدة.</p>
                <p class="mb-2 font-bold gold-text">وتشمل خدمات التقاضي لدينا:</p>
                <ul class="list-disc list-inside space-y-2 text-on-primary/70">
                    <li>إنجاز وإدارة كافة الممارسات والخطوات المعقدة لعملية التقاضي والنزاعات القضائية المستعصية.</li>
                    <li>توفير التمثيل القانوني المتكامل في الدعاوى والخصومات العدائية بالغة الصعوبة بأعلى حنكة ممكنة.</li>
                    <li>قيد ومتابعة كل أنواع الدعاوى والمرافعات في الإجراءات التجارية والمدنية والإدارية والجنائية.</li>
                    <li>التمثيل أمام كافة درجات المحاكم (ابتدائية، استئناف، نقض، إدارية عليا) وحضور التحقيقات الرسمية، وتقديم الإخطارات القانونية.</li>
                </ul>
            `
        },
        {
            title: "قانون الضرائب",
            icon: "receipt_long",
            html: `
                <p class="mb-4 text-on-primary/80">يتمتع مكتب الأصيل بخبرة كبيرة في تقديم الاستشارات الضريبية المتكاملة لمساعدة الشركات والأفراد على الامتثال وتخطي الأزمات الضريبية بنجاح.</p>
                <p class="mb-2 font-bold gold-text">الخدمات الاستشارية والحلول الضريبية التي نقدمها:</p>
                <ul class="list-decimal list-inside space-y-2 text-on-primary/70">
                    <li>تقديم حلول فعالة ومبتكرة لتخطي الشركات والأفراد للأزمات والمنازعات مع مصلحة الضرائب.</li>
                    <li>تقديم استشارات ضريبية محلياً ودولياً لكافة المعاملات المالية والاستثمارية للأفراد والمؤسسات.</li>
                    <li>تقديم الحلول للمشاكل الضريبية بما يسير وفق القوانين واللوائح المعمول بها لتلافي الغرامات.</li>
                    <li>تقديم الخدمات الاستشارية المتخصصة في المجالات التالية:
                        <ul class="list-disc list-inside mr-6 my-1 space-y-1 text-on-primary/60">
                            <li>عمليات الضرائب والإجراءات الإدارية.</li>
                            <li>فرض الضرائب على التراث العائلي والتركات.</li>
                            <li>الضرائب على العقارات والتصرفات العقارية.</li>
                            <li>الضرائب على الأفراد والشركات والضرائب الدولية.</li>
                            <li>الضرائب على عمليات الدمج والاستحواذ واتفاقيات المشاريع المشتركة.</li>
                            <li>الضرائب على اتحاد الشركات ومجموعات العمل وACE وإعادة هيكلة الشركات.</li>
                        </ul>
                    </li>
                </ul>
            `
        }
    ];

    // Modal elements
    const serviceModal = document.getElementById('service-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalActionBtn = document.getElementById('modal-action-btn');

    // Open Modal
    window.openServiceModal = function(index) {
        const service = servicesData[index];
        if (!service) return;

        modalIcon.innerText = service.icon;
        modalTitle.innerText = service.title;
        modalBody.innerHTML = service.html;

        // Action button listener dynamic behavior
        modalActionBtn.onclick = function() {
            closeModal();
            // Scroll to contact form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                // Fill details inside textarea
                const textarea = contactSection.querySelector('textarea');
                if (textarea) {
                    textarea.value = `أود الاستفسار وحجز استشارة قانونية بخصوص خدمة: ${service.title}`;
                    textarea.focus();
                }
            }
        };

        // Show modal with animation
        serviceModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // prevent scrolling behind
        setTimeout(() => {
            serviceModal.classList.remove('opacity-0');
            serviceModal.querySelector('.relative').classList.remove('scale-95');
            serviceModal.querySelector('.relative').classList.add('scale-100');
        }, 10);
    };

    // Close Modal Function
    function closeModal() {
        serviceModal.classList.add('opacity-0');
        serviceModal.querySelector('.relative').classList.remove('scale-100');
        serviceModal.querySelector('.relative').classList.add('scale-95');
        setTimeout(() => {
            serviceModal.classList.add('hidden');
            document.body.style.overflow = ''; // restore scrolling
        }, 300);
    }

    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !serviceModal.classList.contains('hidden')) {
            closeModal();
        }
    });
});
