from flask import Flask, render_template, request, jsonify, make_response
import json
import markdown
from datetime import datetime
import re
from urllib.parse import quote
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
BASE_URL = os.getenv('BASE_URL', 'http://localhost:5000')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SENDER_EMAIL = os.getenv('SENDER_EMAIL', '')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD', '')
RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL', 'vcp171107@gmail.com')

# Utility functions
def load_posts():
    """Load posts from JSON file"""
    try:
        with open('data/posts.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

def is_valid_email(email):
    """Validate email address"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_text(text):
    """Sanitize user input"""
    # Remove potential XSS characters but allow normal text
    text = text.strip()
    if len(text) > 5000:
        text = text[:5000]
    return text

def send_contact_email(name, email, subject, message):
    """Send contact form email"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECIPIENT_EMAIL
        msg['Subject'] = f"[Contact Form] {subject}"
        msg['Reply-To'] = email
        
        # Email body
        body = f"""
New contact form submission:

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}

---
This email was sent from your blog's contact form.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email using Gmail SMTP
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def format_rss_date(date_string):
    """Convert YYYY-MM-DD to RFC 2822 format for RSS"""
    try:
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        # Format: Mon, 15 Jan 2024 10:00:00 GMT
        return formatdate(timeval=date_obj.timestamp(), localtime=False, usegmt=True)
    except:
        return formatdate(localtime=False, usegmt=True)

def calculate_reading_time(content):
    """Calculate reading time based on content length"""
    words = len(content.split())
    reading_time = max(1, words // 200)
    return reading_time

def convert_markdown(content):
    """Convert markdown to HTML"""
    return markdown.markdown(content, extensions=['fenced_code', 'tables', 'codehilite'])

def get_post_by_slug(slug):
    """Get single post by slug"""
    posts = load_posts()
    for post in posts:
        if post['slug'] == slug:
            return post
    return None

def generate_toc(content):
    """Generate table of contents from markdown headings"""
    toc = []
    h2_pattern = re.compile(r'^## (.+)$', re.MULTILINE)
    h3_pattern = re.compile(r'^### (.+)$', re.MULTILINE)
    
    lines = content.split('\n')
    current_h2 = None
    
    for i, line in enumerate(lines):
        h2_match = re.match(r'^## (.+)$', line)
        h3_match = re.match(r'^### (.+)$', line)
        
        if h2_match:
            text = h2_match.group(1)
            h2_id = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
            current_h2 = {
                'id': h2_id,
                'text': text,
                'children': []
            }
            toc.append(current_h2)
        elif h3_match and current_h2:
            text = h3_match.group(1)
            h3_id = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
            current_h2['children'].append({
                'id': h3_id,
                'text': text
            })
    
    return toc

# Custom Jinja2 filters
@app.template_filter('format_date')
def format_date(date_string):
    """Format date string to readable format"""
    try:
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        return date_obj.strftime('%d %b %Y')
    except:
        return date_string

# Routes
@app.route('/')
def home():
    posts = load_posts()
    latest_posts = sorted(posts, key=lambda x: x['date'], reverse=True)[:3]
    return render_template('index.html', latest_posts=latest_posts)

@app.route('/blog')
def blog():
    posts = load_posts()
    
    # Get filter parameters
    category = request.args.get('category', '')
    tag = request.args.get('tag', '')
    search = request.args.get('search', '')
    difficulty = request.args.get('difficulty', '')
    
    # Filter posts
    filtered_posts = posts
    
    if category:
        filtered_posts = [p for p in filtered_posts if p['category'].lower() == category.lower()]
    
    if tag:
        filtered_posts = [p for p in filtered_posts if tag.lower() in [t.lower() for t in p['tags']]]
    
    if difficulty:
        filtered_posts = [p for p in filtered_posts if p['difficulty'].lower() == difficulty.lower()]
    
    if search:
        search_lower = search.lower()
        filtered_posts = [p for p in filtered_posts if 
                         search_lower in p['title'].lower() or 
                         search_lower in p['excerpt'].lower() or
                         any(search_lower in t.lower() for t in p['tags'])]
    
    # Sort by date (newest first)
    filtered_posts = sorted(filtered_posts, key=lambda x: x['date'], reverse=True)
    
    # Pre-defined base categories
    base_categories = ["Digital Forensics", "General Skills"]
    all_categories = list(set([p['category'] for p in posts] + base_categories))
    
    # Pre-defined base tags
    base_tags = [
        "Network", "Memory", "Disk & File System", "Log Analysis", 
        "Steganography", "Document & Malware", "Linux/Command Line Basics", 
        "Data Encoding & Decoding", "Basic Cryptography", 
        "Scripting & Automation", "Regular Expressions", "Web & Network Basics"
    ]
    all_tags = list(set([tag for p in posts for tag in p['tags']] + base_tags))
    
    all_difficulties = list(set(p['difficulty'] for p in posts))
    
    return render_template('blog.html',
                          posts=filtered_posts,
                          categories=sorted(all_categories),
                          tags=sorted(all_tags),
                          difficulties=sorted(all_difficulties),
                          current_category=category,
                          current_tag=tag,
                          current_difficulty=difficulty,
                          current_search=search)

@app.route('/post/<slug>')
def post(slug):
    """Display single blog post"""
    post_data = get_post_by_slug(slug)
    
    if not post_data:
        return render_template('errors/404.html'), 404
    
    # Convert markdown to HTML
    html_content = convert_markdown(post_data['content'])
    post_data['content'] = html_content
    
    # Generate table of contents
    toc = generate_toc(post_data['content'])
    
    # Get all posts for navigation
    posts = load_posts()
    post_index = next((i for i, p in enumerate(posts) if p['slug'] == slug), None)
    
    prev_post = posts[post_index + 1] if post_index is not None and post_index + 1 < len(posts) else None
    next_post = posts[post_index - 1] if post_index is not None and post_index > 0 else None
    
    return render_template('post.html',
                          post=post_data,
                          toc=toc,
                          prev_post=prev_post,
                          next_post=next_post)

@app.route('/tag/<tag_name>')
def tag_archive(tag_name):
    """Archive page for specific tag"""
    posts = load_posts()
    tag_posts = [p for p in posts if tag_name.lower() in [t.lower() for t in p['tags']]]
    tag_posts = sorted(tag_posts, key=lambda x: x['date'], reverse=True)
    
    # Get all tags for sidebar
    all_tags = sorted(list(set(tag for p in posts for tag in p['tags'])))
    
    return render_template('tag.html',
                          tag_name=tag_name,
                          posts=tag_posts,
                          all_tags=all_tags)

@app.route('/category/<category_name>')
def category_archive(category_name):
    """Archive page for specific category"""
    posts = load_posts()
    cat_posts = [p for p in posts if p['category'].lower() == category_name.lower()]
    cat_posts = sorted(cat_posts, key=lambda x: x['date'], reverse=True)
    
    # Get all categories for sidebar
    all_categories = sorted(list(set(p['category'] for p in posts)))
    
    return render_template('category.html',
                          category_name=category_name,
                          posts=cat_posts,
                          all_categories=all_categories)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    """Contact page"""
    if request.method == 'POST':
        # Get form data
        name = sanitize_text(request.form.get('name', ''))
        email = request.form.get('email', '').strip()
        subject = sanitize_text(request.form.get('subject', ''))
        message = sanitize_text(request.form.get('message', ''))
        
        # Validate form data
        if not all([name, email, subject, message]):
            return render_template('contact.html', error='All fields are required')
        
        if len(name) < 2 or len(name) > 100:
            return render_template('contact.html', error='Name must be between 2 and 100 characters')
        
        if not is_valid_email(email):
            return render_template('contact.html', error='Please enter a valid email address')
        
        if len(subject) < 3 or len(subject) > 200:
            return render_template('contact.html', error='Subject must be between 3 and 200 characters')
        
        if len(message) < 10 or len(message) > 5000:
            return render_template('contact.html', error='Message must be between 10 and 5000 characters')
        
        # Try to send email
        if SENDER_EMAIL and SENDER_PASSWORD:
            success = send_contact_email(name, email, subject, message)
            if success:
                return render_template('contact.html', success=True)
            else:
                return render_template('contact.html', error='Failed to send email. Please try again later.')
        else:
            # If email not configured, show warning but allow submission
            return render_template('contact.html', success=True, warning='Email configuration not set up. Your message was received but email notification may not be sent.')
    
    return render_template('contact.html')

@app.route('/feed.xml')
def rss_feed():
    """RSS Feed endpoint"""
    posts = load_posts()
    posts = sorted(posts, key=lambda x: x['date'], reverse=True)
    
    rss_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    rss_xml += '<rss version="2.0">\n'
    rss_xml += '<channel>\n'
    rss_xml += '<title>Cảnh\'s Space - CTF & InfoSec Blog</title>\n'
    rss_xml += f'<link>{BASE_URL}</link>\n'
    rss_xml += '<description>CTF Write-ups & Security Research</description>\n'
    rss_xml += '<language>vi</language>\n'
    
    for post in posts:
        rss_xml += '<item>\n'
        rss_xml += f'<title>{post["title"]}</title>\n'
        rss_xml += f'<link>{BASE_URL}/post/{post["slug"]}</link>\n'
        rss_xml += f'<guid>{BASE_URL}/post/{post["slug"]}</guid>\n'
        rss_xml += f'<description>{post["excerpt"]}</description>\n'
        rss_xml += f'<author>{post["author"]}</author>\n'
        rss_xml += f'<pubDate>{format_rss_date(post["date"])}</pubDate>\n'
        rss_xml += f'<category>{post["category"]}</category>\n'
        rss_xml += '</item>\n'
    
    rss_xml += '</channel>\n'
    rss_xml += '</rss>\n'
    
    response = make_response(rss_xml)
    response.headers['Content-Type'] = 'application/rss+xml; charset=utf-8'
    return response

@app.route('/robots.txt')
def robots():
    """Robots.txt for SEO"""
    robots_txt = f"""User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: {BASE_URL}/sitemap.xml
"""
    response = make_response(robots_txt)
    response.headers['Content-Type'] = 'text/plain'
    return response

@app.route('/sitemap.xml')
def sitemap():
    """Sitemap.xml for SEO"""
    posts = load_posts()
    
    sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    sitemap_xml += f'<url>\n<loc>{BASE_URL}/</loc>\n<priority>1.0</priority>\n</url>\n'
    
    # Blog page
    sitemap_xml += f'<url>\n<loc>{BASE_URL}/blog</loc>\n<priority>0.9</priority>\n</url>\n'
    
    # Contact page
    sitemap_xml += f'<url>\n<loc>{BASE_URL}/contact</loc>\n<priority>0.8</priority>\n</url>\n'
    
    # Posts
    for post in posts:
        sitemap_xml += '<url>\n'
        sitemap_xml += f'<loc>{BASE_URL}/post/{post["slug"]}</loc>\n'
        sitemap_xml += f'<lastmod>{post["updated"]}</lastmod>\n'
        sitemap_xml += '<priority>0.7</priority>\n'
        sitemap_xml += '</url>\n'
    
    # Tags
    all_tags = set(tag for p in posts for tag in p['tags'])
    for tag in all_tags:
        sitemap_xml += '<url>\n'
        sitemap_xml += f'<loc>{BASE_URL}/tag/{quote(tag)}</loc>\n'
        sitemap_xml += '<priority>0.6</priority>\n'
        sitemap_xml += '</url>\n'
    
    # Categories
    all_categories = set(p['category'] for p in posts)
    for category in all_categories:
        sitemap_xml += '<url>\n'
        sitemap_xml += f'<loc>{BASE_URL}/category/{quote(category)}</loc>\n'
        sitemap_xml += '<priority>0.6</priority>\n'
        sitemap_xml += '</url>\n'
    
    sitemap_xml += '</urlset>'
    
    response = make_response(sitemap_xml)
    response.headers['Content-Type'] = 'application/xml'
    return response

@app.route('/api/search')
def search_api():
    """API endpoint for search suggestions"""
    query = request.args.get('q', '').lower()
    posts = load_posts()
    
    results = []
    if query:
        results = [p for p in posts if 
                  query in p['title'].lower() or 
                  query in p['excerpt'].lower()][:5]
    
    return jsonify([{
        'title': p['title'],
        'slug': p['slug'],
        'category': p['category']
    } for p in results])

@app.route('/keep-alive')
def keep_alive():
    """Keep-alive endpoint to prevent Render from sleeping"""
    return jsonify({'status': 'ok', 'message': 'App is awake'}), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('errors/500.html'), 500

if __name__ == '__main__':
    app.run(debug=True)

# Context processor to pass variables to all templates
@app.context_processor
def inject_config():
    return {'BASE_URL': BASE_URL}