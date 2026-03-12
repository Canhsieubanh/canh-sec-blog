# Render Deployment Guide - Cảnh's Security Blog

## 🚀 Các bước Deploy lên Render

### **Bước 1: Chuẩn bị Local Git**
```bash
# Vào thư mục project
cd c:\Users\PHUONG VAN CANH\canh-sec-blog

# Initialize git
git init
git add .
git commit -m "Initial commit - Security blog with games"
```

### **Bước 2: Tạo GitHub Repo**
1. Vào https://github.com/new
2. Đặt tên repo: `canh-sec-blog`
3. Click "Create repository"
4. Chạy lệnh sau (copy từ GitHub):
```bash
git remote add origin https://github.com/YOUR_USERNAME/canh-sec-blog.git
git branch -M main
git push -u origin main
```

### **Bước 3: Deploy lên Render**
1. Vào https://render.com
2. Click "New +" → "Web Service"
3. Chọn "Deploy an existing Git repository"
4. Kết nối GitHub account
5. Chọn repo: `canh-sec-blog`
6. Settings:
   - **Name**: `canh-sec-blog` (tự động)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Region**: `Oregon` (hoặc gần nhất)
   - **Plan**: `Free`
7. Click "Create Web Service"
8. Đợi ~2-3 phút deploy xong

### **Bước 4: Lấy Link Public**
Sau khi deploy xong, bạn sẽ được URL:
```
https://canh-sec-blog.onrender.com
```

Share URL này cho ai cũng vào được! 🎉

---

## 📋 Checklist Files

Render cần các file này (tất cả đã có):
- ✅ `requirements.txt` - Dependencies
- ✅ `Procfile` - Start command
- ✅ `render.yaml` - Config
- ✅ `app.py` - Flask app
- ✅ `templates/` - HTML files
- ✅ `static/` - CSS, JS, Games

---

## 🔧 Troubleshooting

**"Build failed"**
- → Check logs trong Render dashboard
- → Chắc `requirements.txt` có Flask

**"App not starting"**  
- → Check `Procfile` có `gunicorn app:app`
- → Verify `app.py` tồn tại

**"Static files not showing"**
- → Render tự serve `/static` folder
- → No cần config thêm

**"Need to update?"**
- Push code to GitHub → Render auto redeploy
```bash
git add .
git commit -m "Fix bugs"
git push
```

---

## 📊 Thông tin Deploy

- **Free Plan**: 0.5 CPU, 512MB RAM
- **Auto sleep**: Stop sau 15 phút inactive
- **Starter plan**: $12/month (always on)

---

## 💡 Tiếp theo

Sau khi deploy thành công:
1. Share link với bạn bè
2. Thêm blog posts
3. Customize domain (optional)
4. Monitor traffic trong Render dashboard

**Cần giúp gì tiếp? 🚀**
