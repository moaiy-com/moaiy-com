# 🔧 DNS域名配置指南

## 📊 当前状态

### **问题诊断**
```
❌ www.moaiy.com - 无DNS记录
⚠️ moaiy.com - 指向Cloudflare IP（非GitHub Pages）
```

### **DNS查询结果**
```
moaiy.com:
  当前: 104.21.29.92, 172.67.148.183 (Cloudflare CDN)
  应该: 185.199.108.153 (GitHub Pages)

www.moaiy.com:
  当前: 无记录 ❌
  应该: CNAME → moaiy-com.github.io
```

---

## 🎯 解决方案

### **方案A: 直接使用GitHub Pages** ⭐ 推荐（最简单）

#### **步骤1: 配置DNS记录**

登录你的域名服务商（购买moaiy.com的地方），添加以下DNS记录：

##### **A记录（主域名）**
```
类型: A
主机记录: @
记录值:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
TTL: 3600（或默认）
```

##### **CNAME记录（www子域名）**
```
类型: CNAME
主机记录: www
记录值: moaiy-com.github.io
TTL: 3600（或默认）
```

#### **步骤2: 更新GitHub Pages设置**

1. 访问: https://github.com/moaiy-com/moaiy-com/settings/pages
2. 在 "Custom domain" 输入框填写: `moaiy.com`
3. ✅ 勾选 "Enforce HTTPS"
4. 点击 "Save"

#### **步骤3: 验证配置**

等待DNS传播（5-60分钟），然后验证：

```bash
# 检查A记录
dig moaiy.com +short
# 期望输出:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153

# 检查CNAME
dig www.moaiy.com +short
# 期望输出:
# moaiy-com.github.io
```

---

### **方案B: 使用Cloudflare CDN** （高级）

如果你想继续使用Cloudflare（获得DDoS保护、缓存加速等）：

#### **步骤1: 在Cloudflare配置DNS**

登录Cloudflare Dashboard → 选择 moaiy.com → DNS设置

##### **A记录（主域名）**
```
类型: A
名称: @
IPv4地址:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
代理状态: 已代理（橙色云朵）✅
TTL: 自动
```

##### **CNAME记录（www子域名）**
```
类型: CNAME
名称: www
目标: moaiy-com.github.io
代理状态: 已代理（橙色云朵）✅
TTL: 自动
```

#### **步骤2: 配置SSL/TLS**

1. Cloudflare Dashboard → SSL/TLS
2. 加密模式: 选择 "Full (strict)"
3. ✅ 开启 "Always Use HTTPS"

#### **步骤3: 配置页面规则（可选）**

```
URL: www.moaiy.com/*
设置: 转发URL (301 - 永久重定向)
目标URL: https://moaiy.com/$1
```

---

## 📋 常见域名服务商配置指南

### **Cloudflare**
```
1. 登录 https://dash.cloudflare.com
2. 选择 moaiy.com
3. 点击 "DNS" → "Records"
4. 点击 "Add Record"
5. 添加上述A记录和CNAME记录
```

### **阿里云**
```
1. 登录 https://dns.console.aliyun.com
2. 找到 moaiy.com
3. 点击 "解析设置"
4. 添加记录：
   - 记录类型: A
   - 主机记录: @
   - 记录值: 185.199.108.153
   （重复4次，每次一个IP）
   
   - 记录类型: CNAME
   - 主机记录: www
   - 记录值: moaiy-com.github.io
```

### **腾讯云DNSPod**
```
1. 登录 https://console.dnspod.cn
2. 找到 moaiy.com
3. 添加记录：
   - 主机记录: @
   - 记录类型: A
   - 记录值: 185.199.108.153
   
   - 主机记录: www
   - 记录类型: CNAME
   - 记录值: moaiy-com.github.io
```

### **GoDaddy**
```
1. 登录 https://dcc.godaddy.com/manage/
2. 找到 moaiy.com → DNS
3. 添加记录：
   - Type: A
   - Name: @
   - Value: 185.199.108.153
   - TTL: 1 Hour
   
   - Type: CNAME
   - Name: www
   - Value: moaiy-com.github.io
   - TTL: 1 Hour
```

---

## ✅ 验证步骤

### **1. 检查DNS记录**
```bash
# 检查主域名
dig moaiy.com +short

# 检查www子域名
dig www.moaiy.com +short

# 检查CNAME解析
dig www.moaiy.com CNAME +short
```

### **2. 检查GitHub Pages状态**
```bash
gh api repos/moaiy-com/moaiy-com/pages
```

期望看到：
```json
{
  "status": "built",
  "cname": "moaiy.com",
  "https_enforced": true
}
```

### **3. 访问网站**
```
✅ http://moaiy.com
✅ https://moaiy.com
✅ http://www.moaiy.com
✅ https://www.moaiy.com
```

---

## 🐛 常见问题

### **Q: DNS修改后多久生效？**
```
A: 通常5-60分钟，最长48小时
   可用以下命令检查传播状态：
   https://dnschecker.org/#A/moaiy.com
```

### **Q: 为什么www.moaiy.com无法访问？**
```
A: 缺少CNAME记录
   解决: 添加 CNAME www → moaiy-com.github.io
```

### **Q: 如何强制HTTPS？**
```
A: 
1. GitHub Pages设置中勾选 "Enforce HTTPS"
2. 等待证书签发（可能需要1小时）
3. 如果按钮不可点击，等待24小时
```

### **Q: Cloudflare代理还是仅DNS？**
```
A: 
- 仅DNS（灰色云朵）: 更简单，推荐新手
- 已代理（橙色云朵）: 获得CDN加速和DDoS保护
```

---

## 📊 当前需要做的

### **立即执行** ⭐
```
1. 登录域名服务商
2. 修改 moaiy.com 的A记录为GitHub Pages IP
3. 添加 www.moaiy.com 的CNAME记录
4. 等待DNS传播（5-60分钟）
5. 在GitHub Pages设置中勾选 "Enforce HTTPS"
```

### **推荐的DNS配置** ⭐
```
moaiy.com (A记录):
  → 185.199.108.153
  → 185.199.109.153
  → 185.199.110.153
  → 185.199.111.153

www.moaiy.com (CNAME记录):
  → moaiy-com.github.io
```

---

## 🔗 有用的链接

- **GitHub Pages文档**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **DNS检查工具**: https://dnschecker.org
- **DNS传播检查**: https://whatsmydns.net
- **GitHub Pages状态**: https://www.githubstatus.com

---

## 📝 配置检查清单

```
□ 删除或修改现有的错误A记录
□ 添加4个GitHub Pages A记录
□ 添加www的CNAME记录
□ 在GitHub Pages设置Custom domain
□ 等待DNS传播
□ 验证moaiy.com可访问
□ 验证www.moaiy.com可访问
□ 启用HTTPS
□ 测试所有页面
```

---

**建议**: 使用**方案A**（直接GitHub Pages），这是最简单可靠的方式。

**配置完成后，DNS传播可能需要5-60分钟，请耐心等待！** ⏱️
