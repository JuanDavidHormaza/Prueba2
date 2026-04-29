from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .Models.models import CustomUser
from .Models.modelsSENA import Person, Subject, DigitalDictionary, Ranking, Post, TestResult
from .serializers import (
    UserSerializer, UserCreateSerializer, PersonSerializer,
    SubjectSerializer, DigitalDictionarySerializer, RankingSerializer,
    PostSerializer, CustomTokenObtainPairSerializer,
    TestResultSerializer, TestResultCreateSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT login view that returns user info with tokens."""
    serializer_class = CustomTokenObtainPairSerializer


# ==================== AUTH ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user with person data."""
    serializer = UserCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Usuario creado correctamente',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user profile."""
    serializer = UserSerializer(request.user)
    
    # Add permissions based on role
    data = serializer.data
    data['permissions'] = get_role_permissions(request.user.role)
    
    return Response(data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update current user profile."""
    user = request.user
    
    # Update user fields
    if 'email' in request.data:
        user.email = request.data['email']
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        user.last_name = request.data['last_name']
    
    user.save()
    
    # Update person fields if exists
    if user.person:
        person = user.person
        if 'first_name' in request.data:
            person.first_name = request.data['first_name']
        if 'last_name' in request.data:
            person.last_name = request.data['last_name']
        if 'phone_num' in request.data:
            person.phone_num = request.data['phone_num']
        person.save()
    
    return Response(UserSerializer(user).data)


# ==================== USERS (Admin) ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """List all users. Admin only."""
    if request.user.role != 'admin':
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    role_filter = request.query_params.get('role')
    users = CustomUser.objects.all()
    
    if role_filter:
        users = users.filter(role=role_filter)
    
    serializer = UserSerializer(users, many=True)
    
    # Add permissions to each user
    data = serializer.data
    for user_data in data:
        user_obj = users.get(id=user_data['id'])
        user_data['permissions'] = get_role_permissions(user_obj.role)
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, user_id):
    """Get a specific user. Admin only."""
    if request.user.role != 'admin':
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    data = UserSerializer(user).data
    data['permissions'] = get_role_permissions(user.role)
    
    return Response(data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """Update a user. Admin only."""
    if request.user.role != 'admin':
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update fields
    if 'role' in request.data:
        user.role = request.data['role']
    if 'is_active' in request.data:
        user.is_active = request.data['is_active']
    if 'email' in request.data:
        user.email = request.data['email']
    
    user.save()
    
    return Response(UserSerializer(user).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """Delete a user. Admin only."""
    if request.user.role != 'admin':
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Don't allow deleting yourself
    if user.id == request.user.id:
        return Response({'error': 'No puedes eliminarte a ti mismo'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.delete()
    return Response({'message': 'Usuario eliminado'}, status=status.HTTP_204_NO_CONTENT)


# ==================== SUBJECTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_subjects(request):
    """List all subjects."""
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subject(request):
    """Create a new subject. Admin only."""
    if request.user.role != 'admin':
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = SubjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_subject(request, subject_id):
    """Update a subject. Admin only."""
    if request.user.role != 'admin':
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        subject = Subject.objects.get(subject_id=subject_id)
    except Subject.DoesNotExist:
        return Response({'error': 'Materia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = SubjectSerializer(subject, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_subject(request, subject_id):
    """Delete a subject. Admin only."""
    if request.user.role != 'admin':
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        subject = Subject.objects.get(subject_id=subject_id)
    except Subject.DoesNotExist:
        return Response({'error': 'Materia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    subject.delete()
    return Response({'message': 'Materia eliminada'}, status=status.HTTP_204_NO_CONTENT)


# ==================== DIGITAL DICTIONARY ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_dictionary(request):
    """List dictionary entries."""
    subject_id = request.query_params.get('subject')
    entries = DigitalDictionary.objects.all()
    
    if subject_id:
        entries = entries.filter(subject_id=subject_id)
    
    serializer = DigitalDictionarySerializer(entries, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_dictionary_entry(request):
    """Create a dictionary entry. Admin and Teacher only."""
    if request.user.role not in ['admin', 'teacher']:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = DigitalDictionarySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_dictionary_entry(request, word_id, subject_id):
    """Update a dictionary entry."""
    if request.user.role not in ['admin', 'teacher']:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        entry = DigitalDictionary.objects.get(word_id=word_id, subject_id=subject_id)
    except DigitalDictionary.DoesNotExist:
        return Response({'error': 'Entrada no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = DigitalDictionarySerializer(entry, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_dictionary_entry(request, word_id, subject_id):
    """Delete a dictionary entry."""
    if request.user.role not in ['admin', 'teacher']:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        entry = DigitalDictionary.objects.get(word_id=word_id, subject_id=subject_id)
    except DigitalDictionary.DoesNotExist:
        return Response({'error': 'Entrada no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    entry.delete()
    return Response({'message': 'Entrada eliminada'}, status=status.HTTP_204_NO_CONTENT)


# ==================== TEST RESULTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_test_results(request):
    """
    List test results.
    - Students see only their own results
    - Teachers and admins see all results
    """
    if request.user.role == 'student':
        results = TestResult.objects.filter(user=request.user)
    else:
        user_id = request.query_params.get('user_id')
        results = TestResult.objects.all()
        if user_id:
            results = results.filter(user_id=user_id)
    
    serializer = TestResultSerializer(results, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_test_result(request, result_id):
    """Get a specific test result."""
    try:
        result = TestResult.objects.get(result_id=result_id)
    except TestResult.DoesNotExist:
        return Response({'error': 'Resultado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Students can only view their own results
    if request.user.role == 'student' and result.user != request.user:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = TestResultSerializer(result)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_test_result(request):
    """Submit a new test result. Students only."""
    if request.user.role != 'student':
        return Response({'error': 'Solo estudiantes pueden enviar resultados'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = TestResultCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        result = serializer.save()
        return Response(TestResultSerializer(result).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def add_feedback(request, result_id):
    """Add feedback to a test result. Teachers and admins only."""
    if request.user.role not in ['admin', 'teacher']:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        result = TestResult.objects.get(result_id=result_id)
    except TestResult.DoesNotExist:
        return Response({'error': 'Resultado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    feedback = request.data.get('feedback')
    if not feedback:
        return Response({'error': 'Feedback requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    result.feedback = feedback
    result.save()
    
    return Response(TestResultSerializer(result).data)


# ==================== STATISTICS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_statistics(request):
    """Get platform statistics. Admin and Teacher only."""
    if request.user.role not in ['admin', 'teacher']:
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    
    stats = {
        'total_users': CustomUser.objects.count(),
        'total_students': CustomUser.objects.filter(role='student').count(),
        'total_teachers': CustomUser.objects.filter(role='teacher').count(),
        'total_admins': CustomUser.objects.filter(role='admin').count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'total_subjects': Subject.objects.count(),
        'total_dictionary_entries': DigitalDictionary.objects.count(),
    }
    
    return Response(stats)


# ==================== HELPER FUNCTIONS ====================

def get_role_permissions(role):
    """Return permissions based on role."""
    permissions = {
        'admin': {
            'canManageUsers': True,
            'canManageDocuments': True,
            'canViewStatistics': True,
            'canGiveFeedback': True,
            'canTakeQuiz': False,
            'canViewResults': True,
            'canManageSubjects': True,
            'canConfigureLevels': True,
        },
        'teacher': {
            'canManageUsers': False,
            'canManageDocuments': True,
            'canViewStatistics': True,
            'canGiveFeedback': True,
            'canTakeQuiz': False,
            'canViewResults': True,
            'canManageSubjects': False,
            'canConfigureLevels': False,
        },
        'student': {
            'canManageUsers': False,
            'canManageDocuments': False,
            'canViewStatistics': False,
            'canGiveFeedback': False,
            'canTakeQuiz': True,
            'canViewResults': True,
            'canManageSubjects': False,
            'canConfigureLevels': False,
        },
    }
    return permissions.get(role, permissions['student'])
