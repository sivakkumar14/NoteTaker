# NoteTaker Web Application

A modern web application for taking and managing notes, powered by Supabase for backend services.

## Features
- User Authentication (Sign Up, Sign In, Password Reset)
- Email Confirmation
- Create, Read, Update, and Delete Notes
- Secure Data Storage with Supabase
- Responsive and Modern UI

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript
- Supabase (Backend as a Service)

## Setup
1. Create a `.env` file in the root directory
2. Add your Supabase credentials:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```
3. Open `index.html` in your browser

## Project Structure
```
NoteTaker/
├── css/
│   ├── style.css
│   └── dashboard.css
├── js/
│   ├── auth.js
│   └── dashboard.js
├── pages/
│   ├── signup.html
│   ├── signin.html
│   ├── reset-password.html
│   └── dashboard.html
├── index.html
├── .env
└── README.md
```
