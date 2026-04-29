## 📋 Requisitos

Tener instalado:

* Docker
* Docker Compose

---

## ⚙️ Instalación paso a paso

1. Clonar el repositorio:

```bash
git clone https://github.com/jeansebastiansalinas/proyecto_sena.git
cd proyecto_sena
```

---

2. Crear archivo de entorno:

En Windows:

```powershell
copy .env.example .env
```

---

3. Levantar el proyecto:

```bash
docker-compose up --build
```

---

## 🌐 Acceso a la aplicación

* Frontend: http://localhost:5173
* Backend: http://localhost:8000




## 🛑 Si algo falla:

```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

