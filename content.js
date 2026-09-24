/**
 * B站视频画面深色滤镜 + 倍速控制 - 内容脚本
 * 作者: Dua  联系方式: https://duasweb.xyz
 *
 * 功能一：深色滤镜（chrome.storage.local 持久化，storage.onChanged 实时生效）
 * 功能二：视频倍速控制（直接控制 video.playbackRate）
 */
(function () {
  'use strict';

  /* =========================================================
   * 一、深色滤镜
   * =======================================================*/
  const STORAGE_KEY = 'darkVideoFilter';
  const DARK_FILTER =
    'invert(85%) hue-rotate(190deg) saturate(1.1) contrast(100%)';

  let enabled = true; // 滤镜开关，默认开启

  function applyFilter() {
    document.querySelectorAll('video').forEach((v) => {
      v.style.filter = enabled ? DARK_FILTER : 'none';
    });
  }

  const observer = new MutationObserver(() => applyFilter());

  function startObserver() {
    const target = document.body || document.documentElement;
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
    }
  }

  chrome.storage.local.get({ [STORAGE_KEY]: true }, (res) => {
    enabled = res[STORAGE_KEY];
    applyFilter();
    startObserver();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      enabled = changes[STORAGE_KEY].newValue;
      applyFilter();
    }
  });

  function toggleFilter() {
    enabled = !enabled;
    chrome.storage.local.set({ [STORAGE_KEY]: enabled });
    console.log('[深色滤镜]', enabled ? '开启' : '关闭');
  }

  /* =========================================================
   * 二、倍速控制
   * ---------------------------------------------------------
   * 核心：直接写 video.playbackRate；B 站播放器可能会重置速率，
   * 因此监听每个 video 的 ratechange 事件，把速率"钉"回目标值。
   * =======================================================*/
  const SPEED_MIN = 0.125; // 最低倍速
  const SPEED_MAX = 16; // 最高倍速

  let currentSpeed = 1; // 当前目标倍速
  let lastSpeed = 1; // "\" 键用：切回 1 之前记住的上一个速度
  let holdActive = false; // 是否正在"按住右箭头临时加速"
  let speedBeforeHold = 1; // 按住前的速度，用于松开时恢复
  let internalRateChange = false; // 标记是不是我们自己设置的速率，避免 ratechange 反复触发

  /* ------- 倍速悬浮提示（OSD 小圆圈）------- */
  let osdEl = null; // 提示圆圈元素
  let osdHideTimer = null; // 淡出计时器

  // 确保 OSD 元素存在，并挂到"最合适的"容器上（跟随播放器 / 全屏）
  function ensureOsd() {
    if (!osdEl) {
      osdEl = document.createElement('div');
      osdEl.className = '__dua_speed_osd';
      // 内联样式，避免被站点 CSS 影响；浅灰底 + 浅白字的小圆圈
      osdEl.style.cssText = [
        'position:absolute',
        'top:12px',
        'left:12px',
        'z-index:2147483647',
        'width:52px',
        'height:52px',
        'border-radius:50%',
        'background:rgba(180,180,185,0.55)', // 浅灰半透明底
        'color:rgba(255,255,255,0.95)', // 浅白字
        'font:600 14px/1 -apple-system,"Segoe UI","Microsoft YaHei",sans-serif',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'text-align:center',
        'pointer-events:none', // 不挡鼠标操作
        'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
        'backdrop-filter:blur(2px)',
        '-webkit-backdrop-filter:blur(2px)',
        'transition:opacity 0.35s ease',
        'opacity:0',
        'user-select:none',
      ].join(';');
    }

    // 选一个合适的父容器：优先视频的定位父级，否则挂到 body
    const video = getVideos()[0];
    let host = document.body;
    if (video) {
      // 全屏时挂到全屏元素，普通时挂到 video 的父节点
      const fsEl = document.fullscreenElement;
      if (fsEl && fsEl.contains(video)) {
        host = fsEl;
      } else if (video.parentElement) {
        host = video.parentElement;
      }
      // 容器需要是定位上下文，OSD 的 absolute 才相对它
      const pos = getComputedStyle(host).position;
      if (pos === 'static') {
        host.style.position = 'relative';
      }
    }

    if (osdEl.parentElement !== host) {
      host.appendChild(osdEl);
    }
    return osdEl;
  }

  // 把倍速格式化成简洁文本：1x / 1.5x / 0.5x / 0.125x
  function formatSpeed(s) {
    let str = Number(s.toFixed(3)).toString(); // 去掉多余的 0
    return str + 'x';
  }

  // 显示 OSD：更新文字 → 淡入 → 定时淡出
  function showOsd(speed) {
    const el = ensureOsd();
    el.textContent = formatSpeed(speed);
    // 触发淡入
    el.style.opacity = '1';
    if (osdHideTimer) clearTimeout(osdHideTimer);
    osdHideTimer = setTimeout(() => {
      el.style.opacity = '0';
    }, 900); // 停留约 0.9s 后淡出
  }

  // 取当前页面里"主要"的那个 video（优先取正在播放/可见的）
  function getVideos() {
    return Array.from(document.querySelectorAll('video'));
  }

  // 把目标倍速应用到所有 video
  function applySpeed(speed) {
    internalRateChange = true;
    getVideos().forEach((v) => {
      try {
        v.playbackRate = speed;
      } catch (err) {
        /* 某些状态下设置会抛错，忽略即可 */
      }
    });
    // 下一帧再解除标记，确保由此触发的 ratechange 被识别为"内部"
    setTimeout(() => {
      internalRateChange = false;
    }, 0);
  }

  // 规范化：限制在 [MIN, MAX]，并修掉浮点误差
  function clampSpeed(speed) {
    speed = Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed));
    // 保留最多 3 位小数，避免 0.1*... 之类的浮点噪声
    return Math.round(speed * 1000) / 1000;
  }

  // 设置倍速（统一入口）：会记录 lastSpeed、应用到视频、打印日志
  function setSpeed(next, { recordLast = true } = {}) {
    next = clampSpeed(next);
    if (recordLast && next !== currentSpeed) {
      lastSpeed = currentSpeed;
    }
    currentSpeed = next;
    applySpeed(currentSpeed);
    showOsd(currentSpeed);
    console.log('[倍速]', currentSpeed + 'x');
  }

  // 规则 1：按 "-" 减速
  function speedDown() {
    let next;
    if (currentSpeed > 1) {
      next = currentSpeed - 1;
    } else {
      next = currentSpeed / 2;
    }
    setSpeed(next);
  }

  // 规则 2：按 "=" 加速
  function speedUp() {
    let next;
    if (currentSpeed >= 1) {
      next = currentSpeed + 1;
    } else {
      next = currentSpeed * 2;
    }
    setSpeed(next);
  }

  // 规则 3：按 "\" 在 1 与上一个速度之间切换
  function toggleReset() {
    if (currentSpeed !== 1) {
      // 当前不是 1 → 记住当前值，回到 1
      lastSpeed = currentSpeed;
      setSpeed(1, { recordLast: false });
    } else {
      // 当前是 1 → 恢复到上一个速度（若上一个也是 1，则保持 1）
      setSpeed(lastSpeed, { recordLast: false });
    }
  }

  // 规则 4：按住 "→" 右箭头，以当前倍速的 2 倍临时播放；松开恢复
  function startHold() {
    if (holdActive) return;
    holdActive = true;
    speedBeforeHold = currentSpeed;
    // 临时加速，不记录 lastSpeed（松开会恢复）
    const boosted = clampSpeed(currentSpeed * 2);
    applySpeed(boosted);
    showOsd(boosted);
    console.log('[倍速] 按住加速 →', boosted + 'x');
  }

  function endHold() {
    if (!holdActive) return;
    holdActive = false;
    applySpeed(speedBeforeHold);
    currentSpeed = speedBeforeHold;
    showOsd(currentSpeed);
    console.log('[倍速] 松开恢复 →', currentSpeed + 'x');
  }

  // 给新出现的 video 钉住速率：监听 ratechange，若被外部改动则拉回
  function bindRateGuard(video) {
    if (video.__speedGuardBound) return;
    video.__speedGuardBound = true;

    video.addEventListener('ratechange', () => {
      if (internalRateChange) return; // 自己改的，放行
      const target = holdActive
        ? clampSpeed(speedBeforeHold * 2)
        : currentSpeed;
      if (Math.abs(video.playbackRate - target) > 0.001) {
        internalRateChange = true;
        try {
          video.playbackRate = target;
        } catch (err) {
          /* ignore */
        }
        setTimeout(() => {
          internalRateChange = false;
        }, 0);
      }
    });

    // 新视频出现时，立即应用当前倍速
    try {
      video.playbackRate = holdActive
        ? clampSpeed(speedBeforeHold * 2)
        : currentSpeed;
    } catch (err) {
      /* ignore */
    }
  }

  // 在 DOM 变化时给新 video 绑定守卫（复用上面的 observer 回调）
  const speedObserver = new MutationObserver(() => {
    getVideos().forEach(bindRateGuard);
  });

  function startSpeedObserver() {
    const target = document.body || document.documentElement;
    if (target) {
      speedObserver.observe(target, { childList: true, subtree: true });
    }
    getVideos().forEach(bindRateGuard);
  }
  startSpeedObserver();

  /* =========================================================
   * 三、键盘事件
   * ---------------------------------------------------------
   * - 在输入框 / 可编辑元素中不拦截，避免影响打字（如弹幕、搜索框）
   * =======================================================*/
  function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      el.isContentEditable
    );
  }

  document.addEventListener(
    'keydown',
    (e) => {
      // Alt+D：切换深色滤镜（保留原功能）
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleFilter();
        return;
      }

      // 正在输入时不处理倍速快捷键
      if (isTypingTarget(e.target)) return;
      // 带修饰键（Ctrl/Alt/Meta）的组合不处理，避免与浏览器快捷键冲突
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      switch (e.key) {
        case '-': // 规则 1：减速
          e.preventDefault();
          speedDown();
          break;
        case '=': // 规则 2：加速
          e.preventDefault();
          speedUp();
          break;
        case '\\': // 规则 3：切换 1 / 上一个速度
          e.preventDefault();
          toggleReset();
          break;
        case 'ArrowRight': // 规则 4：按住临时 2 倍速
          // keydown 会连续触发（长按自动重复），用 holdActive 去重
          e.preventDefault();
          startHold();
          break;
        default:
          break;
      }
    },
    true // 捕获阶段，尽量早于 B 站自身的快捷键处理
  );

  document.addEventListener(
    'keyup',
    (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        endHold();
      }
    },
    true
  );
})();
