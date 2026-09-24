<div align="center">

# 🌙 B站视频深色滤镜 + 倍速控制 ⏩🎬

**深色反色滤镜护眼 👀 ＋ 键盘快捷倍速 ⏩ —— 看白底课件、刷录播一把梭 ✨**

![Manifest](https://img.shields.io/badge/Manifest-V3-4c8dff?style=flat-square)
![Platform](https://img.shields.io/badge/Chrome%20%7C%20Edge-supported-34a853?style=flat-square)
![Version](https://img.shields.io/badge/version-1.5-orange?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Made with](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-red?style=flat-square)

</div>

---

## 🤔 这是什么？

一款 **Chrome / Edge 浏览器扩展**（Manifest V3），给 B 站（以及 `onlineplayer.app`）的视频提供两大功能：

- 🎨 **深色反色滤镜** —— 白底画面变柔和深色
- ⏩ **视频倍速控制** —— 纯键盘操作，仿 [Global Speed](https://chromewebstore.google.com/detail/global-speed/jpbjcnkcffbooppibceonlgknpkniiff) 原理，直接控制 `playbackRate`，突破播放器自带的倍速档位限制（0.125× ～ 16×）

📚 场景：晚上刷白底 PPT 课件、文档类录播时，刺眼白光变深色不伤眼 😌，还能用 `-` `=` 随手调速、按住 `→` 临时快进 🚀

> 🧬 由一份 Tampermonkey 油猴脚本进化而来，现在是一个带界面、能实时切换、还能倍速的正经扩展啦！

---

## ✨ 功能亮点

| | 功能 | 说明 |
|:---:|---|---|
| 🎨 | **自动反色滤镜** | 页面内所有 `<video>` 一键变深色 |
| ⏩ | **键盘倍速控制** | `-` `=` `\` 调速，按住 `→` 临时加速，0.125×～16× |
| 💬 | **倍速悬浮提示** | 变速时角落弹出浅灰底浅白字小圆圈显示当前倍速，仿 Global Speed |
| 📌 | **速率钉住** | 监听 `ratechange`，对抗播放器自动重置倍速 |
| ⚡ | **实时生效** | 开关切换 **无需刷新页面**（`storage.onChanged`） |
| 🖱️ | **弹窗开关** | 点扩展图标，一个开关搞定，附快捷键说明 |
| ⌨️ | **滤镜快捷键** | `Alt` + `D` 在页面内秒切 |
| 💾 | **状态持久化** | 重启浏览器也记得你的选择 |
| 🔄 | **动态兼容** | `MutationObserver` 兜住动态加载 / 切集的视频 |

---

## ⏩ 视频倍速控制

仿 **Global Speed** 原理：不依赖 B 站播放器的固定倍速菜单，而是直接读写 `video.playbackRate`，因此能玩到 **0.125× 慢放** 和 **16× 极速**，还会自动把被播放器重置的速率"钉"回来。

> ⌨️ 快捷键在**非输入状态**下生效（在弹幕框、搜索框打字时不会误触）。

| 按键 | 作用 | 规则 |
|:---:|---|---|
| <kbd>-</kbd> | **减速** | 当前 `>1` → 减 1；当前 `≤1` → 除以 2；**下限 0.125×** |
| <kbd>=</kbd> | **加速** | 当前 `≥1` → 加 1；当前 `<1` → 乘以 2；**上限 16×** |
| <kbd>\\</kbd> | **一键切换** | 当前 `≠1` → 回到 `1×`（记住原速度）；当前 `=1` → 恢复上一个速度 |
| <kbd>→</kbd> | **按住加速** | 按住时以 **当前倍速 ×2** 播放，**松开立即恢复** |

**举几个例子** 🌰

- 当前 `3×`，按 `-` → `2×`；再按 `-` → `1×`；再按 `-` → `0.5×`（≤1 开始减半）
- 当前 `0.5×`，按 `=` → `1×`；再按 `=` → `2×`（≥1 开始加 1）
- 当前 `2×`，按 `\` → `1×`；再按 `\` → 回到 `2×`
- 当前 `2×`，**按住** `→` → 变 `4×`，**松手** → 回 `2×`

> 💬 **倍速悬浮提示**：每次变速时，画面角落会弹出一个**浅灰底、浅白字的小圆圈**显示当前倍速（如 `2x`、`0.125x`），短暂停留后自动淡出——和 Global Speed 的 OSD 提示一样。提示会跟随播放器容器，全屏时也能正常显示。

---

## ✨ 其它功能亮点

---

## 🚀 安装（开发者模式）

> ℹ️ MV3 扩展未上架商店时，标准方式是「加载已解压文件夹」。

1. 📥 下载本仓库（`Code → Download ZIP`）或 `git clone`，解压
2. 🌐 打开 `chrome://extensions`（Edge 用 `edge://extensions`）
3. 🛠️ 打开右上角 **开发者模式**
4. 📂 点击 **加载已解压的扩展程序**，选中 `bili-dark-filter-extension` 文件夹
5. 🎉 打开任意 B 站视频页，深色滤镜自动生效！

---

## 🎮 使用方法

- 🎨 **滤镜**：点工具栏扩展图标拨动开关，或在视频页按 `Alt` + `D` 切换
- ⏩ **倍速**：在视频页用 `-` `=` `\` 调速，按住 `→` 临时加速（详见上方倍速表）

---

## 🛠️ 自定义滤镜

滤镜强度都在 `content.js` 顶部这一行，随心调 🎚️：

```js
const DARK_FILTER = 'invert(85%) hue-rotate(190deg) saturate(1.1) contrast(100%)';
```

| 参数 | 作用 | 调法 |
|---|---|---|
| `invert` | 反色强度 | 越大越"负片" |
| `hue-rotate` | 色相旋转 | 微调整体色调 |
| `saturate` | 饱和度 | 越大颜色越艳 |
| `contrast` | 对比度 | 越大明暗越分明 |

---

## 📁 目录结构

```
bili-dark-filter-extension/
├── 📄 manifest.json      # 扩展清单（MV3）
├── 📜 content.js         # 注入页面的滤镜逻辑
├── 🖼️ popup.html         # 弹窗界面
├── ⚙️ popup.js           # 弹窗开关逻辑
├── 📖 README.md          # 就是你正在看的这份
├── 📝 LICENSE            # MIT 开源协议
└── 📁 icons/             # 16 / 48 / 128 图标
```

---

## 🧬 从油猴脚本迁移了什么？

| 项目 | 🐒 油猴脚本 | 🧩 本扩展 |
|---|---|---|
| 💾 存储 | `GM_setValue / GM_getValue` | `chrome.storage.local` |
| ⚡ 切换生效 | 需刷新页面 | 实时生效 |
| 🖼️ 界面 | 无 | 弹窗开关 + 快捷键说明 |
| ⌨️ 快捷键 | `Alt+D` + 失效的 `Fn+C` | 保留可用的 `Alt+D` |
| ⏩ 倍速 | 无 | 全新键盘倍速控制（0.125×～16×） |

---

## 🌐 兼容站点

- ✅ `*.bilibili.com`
- ✅ `onlineplayer.app/zh`

想加别的站点？在 `manifest.json` 的 `content_scripts.matches` 里追加对应规则即可 🔧

---

## 🙋 常见问题

<details>
<summary>❓ 为什么装完没反应？</summary>

刷新一下正在打开的 B 站页面，或在 `chrome://extensions` 里点扩展的 🔄 重新加载。
</details>

<details>
<summary>❓ 图标在小尺寸下有点糊？</summary>

图标是一张写实插画，缩到 16px 时细节偏多属正常现象，不影响功能～
</details>

<details>
<summary>❓ 按 <code>-</code> / <code>=</code> 没反应？</summary>

先确认焦点不在输入框（弹幕框、搜索框）里；倍速快捷键在打字时会自动让路。另外部分页面按键可能被播放器抢占，本扩展已用捕获阶段 + `ratechange` 钉住尽量对抗，若仍异常可刷新页面重试。
</details>

<details>
<summary>❓ 倍速会被 B 站重置吗？</summary>

扩展监听了每个视频的 `ratechange` 事件，一旦检测到速率被外部改动，会自动拉回你设定的目标值，所以切集、换清晰度后倍速也能保持。
</details>

<details>
<summary>❓ 能上架 Chrome 商店吗？</summary>

可以！把文件夹打包上传到 Chrome 开发者后台即可，本项目已符合 MV3 规范。
</details>

---

## 👤 作者

**Dua** 🧑‍💻

- 🔗 主页 / 联系方式：[duasweb.xyz](https://duasweb.xyz)

---

## 📄 License

本项目基于 [MIT](./LICENSE) 协议开源 —— 随便用，记得留个版权声明就好 🎈

---

<div align="center">

**如果这个小工具帮到了你，欢迎点个 ⭐ Star 支持一下！**

Made with ❤️ & 🌙 by Dua

</div>
