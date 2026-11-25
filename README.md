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

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, create a Blueprint from this repository and use `render.yaml` at the repository root.
3. Apply the Blueprint. It creates the Django API and React static site.

The free deployment uses SQLite on Render's ephemeral filesystem because a Render account can have only one free PostgreSQL database. Database changes can be lost when the API service restarts or redeploys. Use PostgreSQL for persistent data before using this deployment beyond a demo.

The demo site is seeded with the Seller and Student accounts listed below. Change their passwords before using the deployment beyond a demo.

Demo accounts:

- Seller: `Priya` / `secret123`
- Student: `Arjun` / `secret123`
