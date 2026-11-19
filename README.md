# CampusMart

CampusMart is a campus marketplace built with React and Django REST Framework.

## Features

- User registration and JWT login
- Marketplace search and filters
- Shopping cart and checkout
- Student and seller order views
- Seller listings and dashboard
- Locally served, product-specific stock photos for demo listings; photo credits are in `frontend/public/images/ATTRIBUTION.md`

## Run locally

### Backend

```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_listings
python manage.py createsuperuser
python manage.py runserver
```

Use the username and password you choose when prompted to sign in to Django Admin. The Priya and Arjun demo accounts are not admin accounts.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## URLs

- Frontend: [http://localhost:3000](http://localhost:3000)
- Django API: [http://localhost:8000](http://localhost:8000)
- Django Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

Demo accounts:

- Seller: `Priya` / `secret123`
- Student: `Arjun` / `secret123`
