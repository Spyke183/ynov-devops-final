from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
import os

app = FastAPI()

# Autorise le front (navigateur) a appeler cette API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection():
    """Ouvre une connexion vers la base MySQL (config via variables d'environnement)."""
    return mysql.connector.connect(
        host=os.environ.get("MYSQL_HOST", "db"),
        user=os.environ.get("MYSQL_USER", "root"),
        password=os.environ.get("MYSQL_ROOT_PASSWORD"),
        database=os.environ.get("MYSQL_DATABASE", "ynov_ci"),
    )


def is_admin(email, password):
    """Verifie que le couple email/mot de passe correspond a l'admin (hash SHA-256)."""
    if not email or not password:
        return False
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) FROM admin WHERE email = %s AND password = SHA2(%s, 256)",
        (email, password),
    )
    found = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return found > 0


class UtilisateurIn(BaseModel):
    last_name: str
    first_name: str
    email: str
    birth_date: str
    city: str
    zip_code: str


class Login(BaseModel):
    email: str
    password: str


@app.get("/users")
def list_users():
    """Liste publique des inscrits : informations reduites (id, nom, prenom) + total."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, last_name, first_name FROM utilisateur")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    users = [{"id": r[0], "last_name": r[1], "first_name": r[2]} for r in rows]
    return {"count": len(users), "users": users}


@app.post("/users")
def create_user(user: UtilisateurIn):
    """Enregistre un nouvel inscrit en base (remplace le localStorage)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO utilisateur (last_name, first_name, email, birth_date, city, zip_code)"
        " VALUES (%s, %s, %s, %s, %s, %s)",
        (user.last_name, user.first_name, user.email, user.birth_date, user.city, user.zip_code),
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"id": new_id}


@app.post("/login")
def login(creds: Login):
    """Connexion administrateur."""
    if is_admin(creds.email, creds.password):
        return {"isAdmin": True}
    raise HTTPException(status_code=401, detail="Identifiants invalides")


@app.delete("/users/{user_id}")
def delete_user(user_id: int, x_admin_email: str = Header(None), x_admin_password: str = Header(None)):
    """Supprime un inscrit (reserve a l'admin)."""
    if not is_admin(x_admin_email, x_admin_password):
        raise HTTPException(status_code=403, detail="Acces administrateur requis")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM utilisateur WHERE id = %s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"deleted": user_id}


@app.get("/admin/users")
def admin_list_users(x_admin_email: str = Header(None), x_admin_password: str = Header(None)):
    """Liste complete des inscrits avec leurs informations privees (reserve a l'admin)."""
    if not is_admin(x_admin_email, x_admin_password):
        raise HTTPException(status_code=403, detail="Acces administrateur requis")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, last_name, first_name, email, birth_date, city, zip_code FROM utilisateur"
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    cols = ["id", "last_name", "first_name", "email", "birth_date", "city", "zip_code"]
    return {"users": [dict(zip(cols, r)) for r in rows]}
