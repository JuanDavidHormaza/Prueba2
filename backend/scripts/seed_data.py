"""
Seed script to populate the database with initial data.
Run with: python manage.py shell < scripts/seed_data.py
Or: python manage.py runscript seed_data (if django-extensions is installed)
"""
import os
import sys
import django

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from users.Models.models import CustomUser
from users.Models.modelsSENA import Person, Subject, DigitalDictionary, TestResult


def create_persons_and_users():
    """Create test users with their Person records."""
    
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@gmail.com',
            'password': '123',
            'role': 'admin',
            'first_name': 'Administrador',
            'last_name': 'SENA',
            'doc_type': 'CC',
            'doc_num': '1000000001',
        },
        {
            'username': 'docente',
            'email': 'docente@gmail.com',
            'password': '123',
            'role': 'teacher',
            'first_name': 'Carlos',
            'last_name': 'Martinez',
            'doc_type': 'CC',
            'doc_num': '1000000002',
        },
        {
            'username': 'ana',
            'email': 'ana@gmail.com',
            'password': '123',
            'role': 'teacher',
            'first_name': 'Ana Sofia',
            'last_name': 'Rodriguez',
            'doc_type': 'CC',
            'doc_num': '1000000003',
        },
        {
            'username': 'juan',
            'email': 'juan@gmail.com',
            'password': '123',
            'role': 'student',
            'first_name': 'Juan David',
            'last_name': 'Perez',
            'doc_type': 'CC',
            'doc_num': '1000000004',
        },
        {
            'username': 'maria',
            'email': 'maria@gmail.com',
            'password': '123',
            'role': 'student',
            'first_name': 'Maria Garcia',
            'last_name': 'Lopez',
            'doc_type': 'CC',
            'doc_num': '1000000005',
        },
        {
            'username': 'carlos_est',
            'email': 'carlos@gmail.com',
            'password': '123',
            'role': 'student',
            'first_name': 'Carlos Andres',
            'last_name': 'Lopez',
            'doc_type': 'CC',
            'doc_num': '1000000006',
        },
    ]
    
    created_users = []
    
    for user_data in users_data:
        # Check if user already exists
        if CustomUser.objects.filter(username=user_data['username']).exists():
            print(f"Usuario {user_data['username']} ya existe, omitiendo...")
            created_users.append(CustomUser.objects.get(username=user_data['username']))
            continue
        
        # Create Person
        person = Person.objects.create(
            email=user_data['email'],
            password=user_data['password'],
            doc_type=user_data['doc_type'],
            doc_num=user_data['doc_num'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            status='ACTIVO'
        )
        
        # Create CustomUser
        user = CustomUser.objects.create(
            username=user_data['username'],
            email=user_data['email'],
            password=make_password(user_data['password']),
            role=user_data['role'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            person=person,
            is_active=True
        )
        
        created_users.append(user)
        print(f"Usuario creado: {user.username} ({user.role})")
    
    return created_users


def create_subjects():
    """Create test subjects."""
    
    subjects_data = [
        {'subject_id': 'sub1', 'description': 'Ingles Tecnico'},
        {'subject_id': 'sub2', 'description': 'Gramatica Basica'},
        {'subject_id': 'sub3', 'description': 'Comprension Lectora'},
        {'subject_id': 'sub4', 'description': 'Conversacion'},
    ]
    
    created_subjects = []
    
    for subject_data in subjects_data:
        subject, created = Subject.objects.get_or_create(
            subject_id=subject_data['subject_id'],
            defaults={'description': subject_data['description']}
        )
        created_subjects.append(subject)
        if created:
            print(f"Materia creada: {subject.description}")
        else:
            print(f"Materia {subject.description} ya existe, omitiendo...")
    
    return created_subjects


def create_dictionary_entries(subjects):
    """Create sample dictionary entries."""
    
    if not subjects:
        print("No hay materias para crear entradas de diccionario")
        return []
    
    entries_data = [
        {
            'word_id': 'word1',
            'subject': subjects[0],
            'definition': 'A set of instructions for a computer to execute',
            'synonyms': 'code, script, application',
            'audio': 'https://example.com/audio/algorithm.mp3',
            'video': None,
            'image': 'https://example.com/images/algorithm.png',
        },
        {
            'word_id': 'word2',
            'subject': subjects[0],
            'definition': 'A collection of data organized for easy access',
            'synonyms': 'DB, data store, repository',
            'audio': 'https://example.com/audio/database.mp3',
            'video': 'https://example.com/video/database.mp4',
            'image': 'https://example.com/images/database.png',
        },
        {
            'word_id': 'word3',
            'subject': subjects[1],
            'definition': 'An action word that describes what the subject does',
            'synonyms': 'action word, doing word',
            'audio': 'https://example.com/audio/verb.mp3',
            'video': None,
            'image': 'https://example.com/images/verb.png',
        },
    ]
    
    created_entries = []
    
    for entry_data in entries_data:
        entry, created = DigitalDictionary.objects.get_or_create(
            word_id=entry_data['word_id'],
            subject=entry_data['subject'],
            defaults={
                'definition': entry_data['definition'],
                'synonyms': entry_data['synonyms'],
                'audio': entry_data['audio'],
                'video': entry_data['video'],
                'image': entry_data['image'],
            }
        )
        created_entries.append(entry)
        if created:
            print(f"Entrada de diccionario creada: {entry.word_id}")
        else:
            print(f"Entrada {entry.word_id} ya existe, omitiendo...")
    
    return created_entries


def create_test_results(users):
    """Create sample test results for students."""
    
    students = [u for u in users if u.role == 'student']
    
    if not students:
        print("No hay estudiantes para crear resultados de prueba")
        return []
    
    results_data = [
        {
            'user': students[0],  # Juan
            'score': 85,
            'level': 'B2',
            'correct_answers': 17,
            'total_questions': 20,
            'duration': '8:45',
            'answers': [],
        },
        {
            'user': students[0],  # Juan - previous test
            'score': 70,
            'level': 'B1',
            'correct_answers': 14,
            'total_questions': 20,
            'duration': '9:12',
            'feedback': 'Buen progreso Juan. Te recomiendo practicar mas los tiempos verbales condicionales.',
            'answers': [],
        },
    ]
    
    # Add results for Maria if she exists
    if len(students) > 1:
        results_data.append({
            'user': students[1],  # Maria
            'score': 92,
            'level': 'C1',
            'correct_answers': 18,
            'total_questions': 20,
            'duration': '7:30',
            'answers': [],
        })
    
    # Add results for Carlos if he exists
    if len(students) > 2:
        results_data.append({
            'user': students[2],  # Carlos
            'score': 60,
            'level': 'B1',
            'correct_answers': 12,
            'total_questions': 20,
            'duration': '10:15',
            'answers': [],
        })
    
    created_results = []
    
    for result_data in results_data:
        result = TestResult.objects.create(**result_data)
        created_results.append(result)
        print(f"Resultado creado para: {result.user.username} - {result.level} ({result.score}%)")
    
    return created_results


def main():
    """Main function to run all seed operations."""
    print("=" * 50)
    print("Iniciando seed de datos...")
    print("=" * 50)
    
    print("\n--- Creando usuarios ---")
    users = create_persons_and_users()
    
    print("\n--- Creando materias ---")
    subjects = create_subjects()
    
    print("\n--- Creando entradas de diccionario ---")
    create_dictionary_entries(subjects)
    
    print("\n--- Creando resultados de pruebas ---")
    create_test_results(users)
    
    print("\n" + "=" * 50)
    print("Seed completado!")
    print("=" * 50)
    
    print("\n--- Credenciales de acceso ---")
    print("Admin:     admin@gmail.com / 123")
    print("Docente:   docente@gmail.com / 123")
    print("Docente:   ana@gmail.com / 123")
    print("Estudiante: juan@gmail.com / 123")
    print("Estudiante: maria@gmail.com / 123")
    print("Estudiante: carlos@gmail.com / 123")


if __name__ == '__main__':
    main()
