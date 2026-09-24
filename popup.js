/**
 * 弹窗逻辑：读取 / 写入开关状态
 * 作者: Dua  联系方式: https://duasweb.xyz
 */
const STORAGE_KEY = 'darkVideoFilter';
const toggle = document.getElementById('toggle');

// 打开弹窗时同步当前状态
chrome.storage.local.get({ [STORAGE_KEY]: true }, (res) => {
  toggle.checked = res[STORAGE_KEY];
});

// 用户点击开关时写入 storage，content.js 会通过 onChanged 实时应用
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ [STORAGE_KEY]: toggle.checked });
});
