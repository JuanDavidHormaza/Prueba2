#!/bin/bash

echo "=== Configurando Backend Django ==="

# Crear migraciones
echo "Creando migraciones..."
python manage.py makemigrations users

# Aplicar migraciones
echo "Aplicando migraciones..."
python manage.py migrate

# Crear superusuario (opcional)
echo ""
echo "Para crear un superusuario, ejecuta:"
echo "python manage.py createsuperuser"

echo ""
echo "=== Configuracion completada ==="
echo ""
echo "Para iniciar el servidor:"
echo "python manage.py runserver 8000"
