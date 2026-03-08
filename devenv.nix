{ pkgs, lib, config, ... }:

{
  # ---------- System packages ----------
  packages = with pkgs; [
    git
    curl
    jq
  ];

  # ---------- Environment variables ----------
  env = {
    DATABASE_URL = "postgresql://shopping:shopping@127.0.0.1:5432/shopping_list";
  };

  # ---------- Languages ----------
  languages.python = {
    enable = true;
    version = "3.12";
    venv = {
      enable = true;
      requirements = ./backend/requirements.txt;
    };
  };

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_20;
  };

  # ---------- Services ----------
  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16;
    listen_addresses = "127.0.0.1";
    port = 5432;
    initialDatabases = [
      { name = "shopping_list"; }
    ];
    initialScript = ''
      CREATE USER shopping WITH PASSWORD 'shopping';
      GRANT ALL PRIVILEGES ON DATABASE shopping_list TO shopping;
      ALTER DATABASE shopping_list OWNER TO shopping;
    '';
  };

  # ---------- Processes (run with `devenv up`) ----------
  processes = {
    backend = {
      exec = ''
        export PYTHONPATH="$DEVENV_ROOT/backend:$PYTHONPATH"
        cd $DEVENV_ROOT/backend
        alembic upgrade head
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
      '';
    };
    frontend = {
      exec = ''
        cd $DEVENV_ROOT/frontend
        npm install
        npm run dev
      '';
    };
  };

  # ---------- Scripts ----------
  scripts.migrate.exec = ''
    export PYTHONPATH="$DEVENV_ROOT/backend:$PYTHONPATH"
    cd $DEVENV_ROOT/backend
    alembic upgrade head
  '';

  scripts.seed.exec = ''
    echo "Seeding sample data..."
    curl -s -X POST http://localhost:8000/api/lists \
      -H "Content-Type: application/json" \
      -d '{"name": "Weekly Groceries", "items": [{"name": "Milk"}, {"name": "Eggs"}, {"name": "Bread"}, {"name": "Butter"}]}'
    echo ""
    curl -s -X POST http://localhost:8000/api/lists \
      -H "Content-Type: application/json" \
      -d '{"name": "Party Supplies", "items": [{"name": "Chips"}, {"name": "Soda"}, {"name": "Napkins"}]}'
    echo ""
    echo "Done! 🛒"
  '';

  # ---------- Shell hook ----------
  enterShell = ''
    export PYTHONPATH="$DEVENV_ROOT/backend:$PYTHONPATH"
    echo ""
    echo "🛒 =================================="
    echo "   SHOPPING QUEST — Dev Environment"
    echo "   =================================="
    echo ""
    echo "  Commands:"
    echo "    devenv up      — Start all services (PG + backend + frontend)"
    echo "    migrate        — Run DB migrations"
    echo "    seed           — Insert sample data"
    echo ""
    echo "  URLs:"
    echo "    Frontend:  http://localhost:3000"
    echo "    Backend:   http://localhost:8000"
    echo "    API docs:  http://localhost:8000/docs"
    echo ""
  '';

  # ---------- Git hooks (optional, activate once in a git repo) ----------
  # Uncomment after `git init`:
  # git-hooks.hooks = {
  #   ruff.enable = true;
  #   nixpkgs-fmt.enable = true;
  # };
}
