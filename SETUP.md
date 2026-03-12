# Cảnh's Security Blog - Setup Guide

## ✅ Project Structure Complete!

Your blog is now professionally set up. Here's what's been created:

```
canh-sec-blog/
├── app.py                  # Main Flask application
├── config.py              # Configuration (dev/prod/test)
├── requirements.txt       # Python dependencies
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation
├── SETUP.md              # This file
│
├── static/
│   ├── css/
│   │   └── style.css     # Custom styles
│   ├── js/
│   │   └── main.js       # Main JavaScript
│   ├── images/           # Images & logo directory
│   ├── games/
│   │   ├── dino/
│   │   │   ├── dino.css
│   │   │   └── dino.js
│   │   └── flappy/
│   │       └── flappy.js
│   └── (other assets)
│
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Homepage
│   ├── blog.html         # Blog listing
│   └── errors/
│       ├── 404.html      # 404 page
│       └── 500.html      # 500 page
│
└── data/
    ├── posts.json        # Blog posts data
    └── projects.md       # Projects info
```

## 🚀 Quick Start

### 1. Install Dependencies
Open terminal and run:
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

Access at: **http://localhost:5000**

## 📋 What's Included

### Pages
- **Home** (`/`) - Hero section with featured content and mini-games
- **Blog** (`/blog`) - Blog post listing page
- **404** - Not found page
- **500** - Server error page

### Features
- ✅ Dark theme (GitHub style)
- ✅ Responsive design (Tailwind CSS)
- ✅ Professional navigation
- ✅ Blog system ready
- ✅ Mini-games section
- ✅ Error pages
- ✅ Static assets organized

## 🎨 Customization

### Colors & Theme
Edit `static/css/style.css` and `templates/base.html` for custom styling.
Current theme uses:
- Primary: `#58a6ff` (GitHub blue)
- Background: `#0d1117` (Dark)
- Text: `#c9d1d9` (Light gray)

### Blog Posts
Blog posts are stored in `data/posts.json`. Add new posts by adding entries to this file.

### Navigation Links
Update navigation in `templates/base.html` (`<nav>` section).

## 🛠️ Next Steps

### 1. Add Your Logo
Place your logo in `static/images/logo.png`

### 2. Create Blog Posts
Edit `data/posts.json` and add your write-ups

### 3. Update Social Links
Update footer links in `templates/base.html`

### 4. Add Contact Information
Update contact info in the footer

### 5. Implement Full Blog Functionality
The app is ready for more advanced features:
- Load posts from JSON
- Add search functionality
- Add pagination
- Add comments system
- etc.

## 📦 Dependencies

- Flask 2.3.3 - Web framework
- Werkzeug 2.3.7 - WSGI utilities

See `requirements.txt` for full list.

## 🔐 Security Notes

- Change `SECRET_KEY` in `config.py` for production
- Set `FLASK_ENV=production` when deploying
- Enable HTTPS in production
- Use a proper database instead of JSON for scaling

## 📝 Configuration

Environment variables you can set:
- `FLASK_ENV` - Set to 'development', 'production', or 'testing'
- `SECRET_KEY` - Secret key for sessions (auto-generated, change for production)

## 🚀 Deployment

To deploy to production:

1. Set environment variables:
   ```bash
   set FLASK_ENV=production
   set SECRET_KEY=your-secret-key-here
   ```

2. Use a production server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```

3. Set up a reverse proxy (Nginx/Apache)

## 💡 Tips

- Keep `__pycache__/` and `*.pyc` in `.gitignore` (already done)
- Use virtual environment: `python -m venv venv`
- Test locally before deploying
- Keep sensitive data in environment variables

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jinja2 Templates](https://jinja.palletsprojects.com/)

---

**Ready to start blogging?** 🚀
Just add your content and you're good to go!
