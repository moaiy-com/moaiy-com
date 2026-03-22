# 🗿 Moaiy Official Website

> **Moaiy - Encryption Made Simple**
>
> 现代WEB4风格官方网站，配备3D动画摩埃石像和动态天气系统

## 🎨 特色

- **🕶️ 戴墨镜的摩埃石像** - 简约现代 + 神秘感
- **🌤️ 7种天气循环** - 70秒完整循环，自动播放
- **⚡ 极致性能** - Astro静态生成 + Three.js优化
- **📱 响应式设计** - 桌面60FPS / 移动30FPS

## 🛠️ 技术栈

- **框架**: [Astro 4.x](https://astro.build)
- **样式**: [Tailwind CSS 3.x](https://tailwindcss.com)
- **3D**: [Three.js](https://threejs.org) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **动画**: [GSAP](https://greensock.com/gsap/)
- **部署**: GitHub Pages

## 🚀 快速开始

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 开发

\`\`\`bash
pnpm dev
\`\`\`

访问 http://localhost:4321

### 构建

\`\`\`bash
pnpm build
\`\`\`

### 预览

\`\`\`bash
pnpm preview
\`\`\`

## 📁 项目结构

\`\`\`
moaiy-com/
├── src/
│   ├── components/
│   │   ├── HeroScene.jsx      # 3D场景
│   │   ├── Moai.jsx           # 摩埃石像
│   │   └── WeatherSystem.jsx  # 天气系统
│   ├── layouts/
│   │   └── BaseLayout.astro   # 基础布局
│   ├── pages/
│   │   └── index.astro        # 首页
│   └── styles/
│       └── global.css         # 全局样式
├── public/                    # 静态资源
├── astro.config.mjs           # Astro配置
├── tailwind.config.mjs        # Tailwind配置
└── package.json
\`\`\`

## 🗿 摩埃石像设计

### 外观特征
- **风格**: 简约现代 + 略带卡通
- **表情**: 轻微上扬的微笑
- **配饰**: 时髦墨镜（薄荷绿渐变镜片）
- **光晕**: 薄荷绿品牌色

### 墨镜设计
- **款式**: 圆角方形（现代简约）
- **镜片**: 薄荷绿渐变（呼应品牌色）
- **效果**: 动态反光
- **神秘感**: ⭐⭐⭐⭐⭐

## 🌤️ 天气系统（7x10秒）

1. **☀️ 白天** (0-10s) - 白云飘，绿草地
2. **🌙 黑夜** (10-20s) - 星空闪烁
3. **💨 刮风** (20-30s) - 强风粒子
4. **🌧️ 下雨** (30-40s) - 雨滴落下
5. **⛈️ 雷电** (40-50s) - 闪电雷鸣
6. **❄️ 暴风雪** (50-60s) - 大雪纷飞
7. **🌪️ 龙卷风** (60-70s) - 极端风暴

→ **自动循环，无限播放**

## 🎨 品牌色

\`\`\`css
/* 主色调 */
--bg-primary: #0A0E27      /* 深空蓝 */
--bg-secondary: #151B3B    /* 午夜蓝 */
--bg-tertiary: #1E2545     /* 暗紫蓝 */

/* 强调色 */
--accent-primary: #4ECDC4  /* 薄荷绿 ⭐ */
--accent-secondary: #45B7D1 /* 天空蓝 */

/* 文字色 */
--text-primary: #F9FAFB    /* 几乎白 */
--text-secondary: #D1D5DB  /* 浅灰 */
--text-tertiary: #9CA3AF   /* 中灰 */
\`\`\`

## 📊 性能指标

### 桌面端
- ✅ FPS: 60
- ✅ 内存: < 80MB
- ✅ GPU: < 40%
- ✅ 加载时间: < 3秒

### 移动端
- ✅ FPS: 30
- ✅ 内存: < 40MB
- ✅ GPU: < 25%
- ✅ 加载时间: < 4秒

## 📝 开发进度

- [x] 项目初始化
- [x] 基础布局
- [x] 摩埃石像3D模型
- [x] 天气系统框架
- [ ] 7种天气完整实现
- [ ] 移动端优化
- [ ] 其他页面（Download, Docs等）
- [ ] 部署上线

## 🚀 部署

### GitHub Pages

\`\`\`bash
pnpm build
\`\`\`

将 \`dist/\` 目录部署到 GitHub Pages

## 📄 许可证

MIT © Moaiy

---

**🌐 Website**: https://moaiy.com  
**🐙 GitHub**: https://github.com/tau-gast/moaiy-com  
**📧 Contact**: support@moaiy.com
