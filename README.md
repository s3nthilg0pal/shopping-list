# 🛒 Shopping Quest

> An 8-bit retro-style, mobile-first shopping list app.

![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Stack](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## Features

- ✅ Create shopping lists with checklist items
- ✅ Check/uncheck items as you shop
- ✅ View shopping history by day
- ✅ Mobile-first responsive design
- ✅ 8-bit pixel art aesthetic
- ✅ Kubernetes + ArgoCD deployment ready

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Frontend   | React + Vite + Tailwind  |
| Backend    | Python / FastAPI         |
| Database   | PostgreSQL 16            |
| Deployment | Docker, Kubernetes, Argo |

## Project Structure

```
shopping-list/
├── devenv.nix               # Nix devenv config
├── devenv.yaml              # Nix inputs
├── .envrc                   # direnv auto-activation
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── routes.py        # API endpoints
│   │   └── database.py      # DB connection
│   ├── alembic/             # DB migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── ListDetail.jsx
│   │   │   └── HistoryScreen.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── tailwind.config.js
├── k8s/
│   ├── base/                # Kubernetes manifests
│   │   ├── kustomization.yaml
│   │   ├── namespace.yaml
│   │   ├── postgres.yaml
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   └── ingress.yaml
│   └── argocd/
│       └── application.yaml
└── docker-compose.yml       # Local dev
```

## Local Development

### Prerequisites

- [Nix](https://nixos.org/download) with flakes enabled
- [devenv](https://devenv.sh/getting-started/)
- (Optional) [direnv](https://direnv.net/) for auto-activation

### Quick Start with devenv (recommended)

```bash
# Enter the dev shell (auto-installs Python 3.12, Node 20, PostgreSQL 16)
devenv shell

# Start everything — PostgreSQL, backend, and frontend
devenv up
```

That's it! PostgreSQL starts automatically with the right user/database configured.

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:3000         |
| Backend  | http://localhost:8000         |
| API Docs | http://localhost:8000/docs    |

#### Handy devenv scripts

```bash
migrate    # Run alembic migrations
seed       # Insert sample shopping lists
```

#### With direnv (auto-activate on cd)

```bash
direnv allow    # One-time — shell activates automatically when you cd in
```

### Quick Start with Docker Compose

```bash
docker compose up --build
```

App will be available at `http://localhost:3000`

### Manual Setup

#### 1. Start PostgreSQL

```bash
docker run -d --name shopping-pg \
  -e POSTGRES_USER=shopping \
  -e POSTGRES_PASSWORD=shopping \
  -e POSTGRES_DB=shopping_list \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:8000`.

## API Endpoints

| Method   | Endpoint                          | Description              |
| -------- | --------------------------------- | ------------------------ |
| `GET`    | `/api/lists`                      | Get all lists (+ filter) |
| `POST`   | `/api/lists`                      | Create a new list        |
| `GET`    | `/api/lists/:id`                  | Get list with items      |
| `PUT`    | `/api/lists/:id`                  | Update list name         |
| `DELETE` | `/api/lists/:id`                  | Delete a list            |
| `GET`    | `/api/lists/dates`                | Get dates with lists     |
| `POST`   | `/api/lists/:id/items`            | Add item to list         |
| `PATCH`  | `/api/lists/:id/items/:item_id`   | Toggle/update item       |
| `DELETE` | `/api/lists/:id/items/:item_id`   | Delete item              |
| `GET`    | `/health`                         | Health check             |

## Kubernetes Deployment

### Build & Push Images

```bash
# Build images (replace with your registry)
docker build -t <registry>/shopping-list-backend:latest ./backend
docker build -t <registry>/shopping-list-frontend:latest ./frontend

# Push
docker push <registry>/shopping-list-backend:latest
docker push <registry>/shopping-list-frontend:latest
```

### Update image references

Edit `k8s/base/backend.yaml` and `k8s/base/frontend.yaml` to point to your container registry images.

### Deploy with Kustomize (manual)

```bash
kubectl apply -k k8s/base/
```

### Deploy with ArgoCD

1. Edit `k8s/argocd/application.yaml` — update the `repoURL` to your git repository.
2. Apply the ArgoCD application:

```bash
kubectl apply -f k8s/argocd/application.yaml
```

3. ArgoCD will automatically sync and deploy all resources. It's configured with:
   - **Auto-sync**: Changes in git are automatically applied
   - **Self-heal**: Drift from desired state is corrected
   - **Auto-prune**: Removed resources are cleaned up

### Ingress

The app is exposed via Ingress at `shopping.local`. Add this to your `/etc/hosts` or configure your DNS:

```
<INGRESS_IP>  shopping.local
```

## License

MIT
