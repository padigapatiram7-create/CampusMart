# CampusMart

CampusMart is a campus marketplace built with React and Django REST Framework.

## Features

- User registration and JWT login
- Marketplace search and filters
- Shopping cart and checkout
- Student and seller order views
- Seller listings and dashboard

## Run locally

### Backend

```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_listings
python manage.py runserver
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Demo accounts:

- Seller: `Priya` / `secret123`
- Student: `Arjun` / `secret123`
