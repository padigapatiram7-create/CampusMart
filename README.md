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
python manage.py runserver
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## URLs

- Frontend: [http://localhost:3000](http://localhost:3000)
- Django API: [http://localhost:8000](http://localhost:8000) (opens the listings API)
- Listings endpoint: [http://localhost:8000/api/listings/](http://localhost:8000/api/listings/)
- Django Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

Demo accounts:

- Seller: `Priya` / `secret123`
- Student: `Arjun` / `secret123`
