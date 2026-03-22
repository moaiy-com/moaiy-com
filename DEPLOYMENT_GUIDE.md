# 🚀 GitHub Pages Deployment Guide

> **Complete guide to deploy Moaiy website to GitHub Pages with custom domain

---

## ✅ Current Status

### GitHub Pages Configuration
```json
{
  "status": "errored",          // ⚠️ Build failed
  "build_type": "legacy",       // ⚠️ Using legacy builder
  "url": "moaiy-com.github.io/moaiy-com/",
  "custom_domain": null         // ⚠️ Not configured yet
}
```

### What's Done
- ✅ GitHub Pages enabled
- ✅ Source branch: `master`
- ✅ Source path: `/` (root)

### What's Missing
- ⚠️ GitHub Actions workflow (for Astro builds)
- ⚠️ Custom domain configuration
- ⚠️ DNS configuration

---

## 🔧 Step 1: Add GitHub Actions Workflow

### **Created File: `.github/workflows/deploy.yml`**

This workflow will:
1. ✅ Build Astro project automatically
2. ✅ Upload build artifacts
3. ✅ Deploy to GitHub Pages

**Trigger**: Every push to `master` branch

---

## 🌐 Step 2: Configure GitHub Pages for GitHub Actions

### **2.1 Go to Repository Settings**

```
https://github.com/moaiy-com/moaiy-com/settings/pages
```

### **2.2 Change Build Source**

```
Current: Deploy from a branch (legacy)
Required: GitHub Actions ✅

Steps:
1. Visit Settings → Pages
2. Under "Build and deployment"
3. Change "Source" from "Deploy from a branch" to "GitHub Actions"
4. Save
```

---

## 🌍 Step 3: Configure Custom Domain (moaiy.com)

### **3.1 Add CNAME File** ✅

**File**: `public/CNAME`
```
moaiy.com
```

This file will be automatically deployed with your site.

### **3.2 Configure DNS**

**Go to your domain registrar (where you bought moaiy.com)**

#### **Option A: Apex Domain (moaiy.com)** ⭐ Recommended

```
Type: A
Name: @
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153

TTL: 3600 (or default)
```

#### **Option B: Subdomain (www.moaiy.com)**

```
Type: CNAME
Name: www
Value: moaiy-com.github.io

TTL: 3600 (or default)
```

#### **Option C: Both (Recommended)** ⭐

Configure both A record and CNAME:

```
# A Record for apex domain
Type: A
Name: @
Values: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153

# CNAME for www subdomain
Type: CNAME
Name: www
Value: moaiy-com.github.io
```

### **3.3 Configure in GitHub**

**After DNS is configured:**

```
1. Go to Settings → Pages
2. Custom domain: moaiy.com
3. Check "Enforce HTTPS" ✅
4. Wait for DNS check to pass
```

---

## 📊 Step 4: Verify Configuration

### **4.1 Check GitHub Actions**

```
https://github.com/moaiy-com/moaiy-com/actions
```

After pushing the workflow file:
- ✅ New workflow run should appear
- ✅ Should complete successfully
- ✅ Green checkmark = deployed

### **4.2 Check Deployment Status**

```bash
gh api repos/moaiy-com/moaiy-com/pages
```

Expected:
```json
{
  "status": "built",      // ✅ Not "errored"
  "build_type": "workflow", // ✅ Not "legacy"
  "cname": "moaiy.com"     // ✅ Custom domain
}
```

### **4.3 Test URLs**

**Without custom domain:**
```
https://moaiy-com.github.io/moaiy-com/
```

**With custom domain:**
```
https://moaiy.com
```

---

## 🔍 DNS Verification

### **Check DNS Propagation**

```bash
# Check A records
dig moaiy.com +short

# Expected output:
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

# Check CNAME
dig www.moaiy.com +short

# Expected output:
moaiy-com.github.io.
```

### **Online DNS Checkers**

- https://dnschecker.org
- https://whatsmydns.net
- https://viewdns.info

---

## ⏱️ Timeline

### **Immediate (0-5 minutes)**
```
1. Push workflow file → Git push
2. GitHub Actions starts
3. Build process begins
```

### **Short-term (5-15 minutes)**
```
1. Build completes
2. Site deployed to GitHub Pages
3. Available at moaiy-com.github.io/moaiy-com/
```

### **Medium-term (15 min - 48 hours)**
```
1. DNS propagates worldwide
2. Custom domain becomes active
3. HTTPS certificate issued
4. Available at moaiy.com
```

---

## 🐛 Troubleshooting

### **Problem: Build Still Failing**

**Solution:**
```bash
# Check workflow syntax
cat .github/workflows/deploy.yml

# Ensure permissions are correct
# Go to Settings → Actions → General
# Ensure "Read and write permissions" is selected
```

### **Problem: Custom Domain Not Working**

**Solution:**
```bash
# 1. Check CNAME file exists
cat public/CNAME

# 2. Verify DNS
dig moaiy.com

# 3. Check GitHub Pages settings
# Settings → Pages → Custom domain should show moaiy.com
```

### **Problem: HTTPS Certificate Pending**

**Solution:**
```
1. Wait 24-48 hours after DNS configuration
2. Ensure "Enforce HTTPS" is checked
3. Remove and re-add custom domain if stuck
```

---

## 📝 Checklist

### **Before Deployment**
```
✅ Workflow file created
✅ CNAME file created
✅ astro.config.mjs configured
✅ Code committed and pushed
```

### **GitHub Configuration**
```
⏳ Change Pages source to "GitHub Actions" (DO THIS NOW)
⏳ Set custom domain to "moaiy.com"
⏳ Enable "Enforce HTTPS"
```

### **DNS Configuration**
```
⏳ Configure A records
⏳ Configure CNAME (optional)
⏳ Wait for propagation
```

### **Verification**
```
⏳ Check Actions tab for successful build
⏳ Test moaiy-com.github.io/moaiy-com/
⏳ Test moaiy.com (after DNS propagates)
⏳ Verify HTTPS certificate
```

---

## 🚀 Quick Start Commands

### **Push to Deploy**

```bash
cd /home/taugast/.openclaw/workspace-coding/moaiy-com

# Add new files
git add .github/workflows/deploy.yml
git add public/CNAME
git add astro.config.mjs

# Commit
git commit -m "feat: Add GitHub Pages deployment workflow

- Add GitHub Actions workflow for automatic deployment
- Add CNAME file for custom domain (moaiy.com)
- Update Astro config for production

Deploy to: https://moaiy.com"

# Push
git push origin master
```

### **Monitor Deployment**

```bash
# Watch Actions
gh run list --repo moaiy-com/moaiy-com --limit 5

# Check Pages status
gh api repos/moaiy-com/moaiy-com/pages
```

---

## 📊 Expected URLs

### **Immediate Access (after build)**
```
https://moaiy-com.github.io/moaiy-com/
```

### **Custom Domain (after DNS)**
```
https://moaiy.com
https://www.moaiy.com (if configured)
```

---

## 🎯 Next Actions

### **Required NOW**
```
1. ⚠️ Go to GitHub Settings → Pages
2. ⚠️ Change "Source" to "GitHub Actions"
3. ⚠️ Push workflow files
4. ⚠️ Configure DNS
```

### **After Deployment**
```
□ Test all pages
□ Check 3D scene performance
□ Verify weather animations
□ Test mobile responsiveness
□ Check SEO meta tags
```

---

## 📚 Resources

### **GitHub Pages Docs**
- https://docs.github.com/en/pages
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

### **Astro Deployment**
- https://docs.astro.build/en/guides/deploy/github/

### **DNS Configuration**
- https://dnschecker.org
- https://whatsmydns.net

---

_Updated: 2026-03-22 11:51 (Asia/Shanghai)_
