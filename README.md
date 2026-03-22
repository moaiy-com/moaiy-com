# 🗿 Moaiy Official Website

> **Moaiy - Encryption Made Simple**
>
> Modern WEB4-style official website with 3D animated Moai statue and dynamic weather system

## 🎨 Features

- **🕶️ Sunglasses-Wearing Moai Statue** - Minimalist modern + mysterious
- **🌤️ 7 Weather Cycles** - 70-second complete loop, auto-play
- **⚡ Extreme Performance** - Astro static generation + Three.js optimization
- **📱 Responsive Design** - 60 FPS desktop / 30 FPS mobile

## 🛠️ Tech Stack

- **Framework**: [Astro 4.x](https://astro.build)
- **Styling**: [Tailwind CSS 3.x](https://tailwindcss.com)
- **3D**: [Three.js](https://threejs.org) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **Animation**: [GSAP](https://greensock.com/gsap/)
- **Deployment**: GitHub Pages

## 🚀 Quick Start

### Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### Development

\`\`\`bash
pnpm dev
\`\`\`

Visit http://localhost:4321

### Build

\`\`\`bash
pnpm build
\`\`\`

### Preview

\`\`\`bash
pnpm preview
\`\`\`

## 📁 Project Structure

\`\`\`
moaiy-com/
├── src/
│   ├── components/
│   │   ├── HeroScene.jsx      # 3D scene
│   │   ├── Moai.jsx           # Moai statue
│   │   └── WeatherSystem.jsx  # Weather system
│   ├── layouts/
│   │   └── BaseLayout.astro   # Base layout
│   ├── pages/
│   │   └── index.astro        # Homepage
│   └── styles/
│       └── global.css         # Global styles
├── public/                    # Static assets
├── astro.config.mjs           # Astro config
├── tailwind.config.mjs        # Tailwind config
└── package.json
\`\`\`

## 🗿 Moai Statue Design

### Appearance
- **Style**: Minimalist modern + slightly cartoonish
- **Expression**: Slight upward smile
- **Accessory**: Stylish sunglasses (mint green gradient lenses)
- **Glow**: Mint green brand color

### Sunglasses Design
- **Style**: Rounded square (modern minimalist)
- **Lenses**: Mint green gradient (matches brand color)
- **Effect**: Dynamic reflection
- **Mystery Level**: ⭐⭐⭐⭐⭐

## 🌤️ Weather System (7×10s)

1. **☀️ Day** (0-10s) - White clouds, green grass
2. **🌙 Night** (10-20s) - Starry sky
3. **💨 Wind** (20-30s) - Strong wind particles
4. **🌧️ Rain** (30-40s) - Falling raindrops
5. **⛈️ Lightning** (40-50s) - Thunder and lightning
6. **❄️ Blizzard** (50-60s) - Heavy snowfall
7. **🌪️ Tornado** (60-70s) - Extreme storm

→ **Auto-loop, infinite playback**

## 🎨 Brand Colors

\`\`\`css
/* Primary Colors */
--bg-primary: #0A0E27      /* Deep space blue */
--bg-secondary: #151B3B    /* Midnight blue */
--bg-tertiary: #1E2545     /* Dark purple blue */

/* Accent Colors */
--accent-primary: #4ECDC4  /* Mint green ⭐ */
--accent-secondary: #45B7D1 /* Sky blue */

/* Text Colors */
--text-primary: #F9FAFB    /* Almost white */
--text-secondary: #D1D5DB  /* Light gray */
--text-tertiary: #9CA3AF   /* Medium gray */
\`\`\`

## 📊 Performance Metrics

### Desktop
- ✅ FPS: 60
- ✅ Memory: < 80MB
- ✅ GPU: < 40%
- ✅ Load Time: < 3s

### Mobile
- ✅ FPS: 30
- ✅ Memory: < 40MB
- ✅ GPU: < 25%
- ✅ Load Time: < 4s

## 📝 Development Progress

- [x] Project initialization
- [x] Base layout
- [x] Moai statue 3D model
- [x] Weather system framework
- [ ] Complete 7 weather implementations
- [ ] Mobile optimization
- [ ] Other pages (Download, Docs, etc.)
- [ ] Deployment

## 🚀 Deployment

### GitHub Pages

\`\`\`bash
pnpm build
\`\`\`

Deploy the \`dist/\` directory to GitHub Pages

## 📄 License

MIT © Moaiy

---

**🌐 Website**: https://moaiy.com  
**🐙 GitHub**: https://github.com/moaiy-com/moaiy-com  
**📧 Contact**: support@moaiy.com
