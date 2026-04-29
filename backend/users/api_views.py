from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .Models.modelsSENA import Person, User, Subject, DigitalDictionary, Ranking, Post, UserLog
from .Models.models import CustomUser
from .serializers import (
    PersonSerializer, UserSerializer, SubjectSerializer, 
    DigitalDictionarySerializer, RankingSerializer, PostSerializer,
    UserLogSerializer, CustomUserSerializer, RegisterSerializer
)


# ============== AUTH ENDPOINTS ==============

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Registrar un nuevo usuario"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Crear tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Usuario creado correctamente',
            'user': CustomUserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login con username/email y password"""
    username = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'success': False,
            'error': 'Username/email y password son requeridos'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Intentar autenticar por username
    user = authenticate(username=username, password=password)
    
    # Si falla, intentar por email
    if not user:
        try:
            user_obj = CustomUser.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except CustomUser.DoesNotExist:
            pass
    
    if user:
        if not user.is_active:
            return Response({
                'success': False,
                'error': 'Cuenta inactiva'
            }, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'user': CustomUserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    
    return Response({
        'success': False,
        'error': 'Credenciales incorrectas'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Obtener perfil del usuario autenticado"""
    return Response({
        'success': True,
        'user': CustomUserSerializer(request.user).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Actualizar perfil del usuario autenticado"""
    serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'user': serializer.data
        })
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============== PERSONS ENDPOINTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_person_list(request):
    """Listar todas las personas"""
    persons = Person.objects.all()
    serializer = PersonSerializer(persons, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_person_create(request):
    """Crear una nueva persona"""
    serializer = PersonSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def api_person_detail(request, pk):
    """Obtener, actualizar o eliminar una persona"""
    try:
        person = Person.objects.get(pk=pk)
    except Person.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Persona no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = PersonSerializer(person)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'PUT':
        serializer = PersonSerializer(person, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        person.delete()
        return Response({'success': True, 'message': 'Persona eliminada'}, status=status.HTTP_204_NO_CONTENT)


# ============== USERS ENDPOINTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_list(request):
    """Listar todos los usuarios SENA"""
    users = User.objects.select_related('person').all()
    serializer = UserSerializer(users, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_user_create(request):
    """Crear un nuevo usuario SENA"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============== SUBJECTS ENDPOINTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_subject_list(request):
    """Listar todas las materias"""
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_subject_create(request):
    """Crear una nueva materia"""
    serializer = SubjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============== DICTIONARY ENDPOINTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dictionary_list(request):
    """Listar todas las palabras del diccionario"""
    words = DigitalDictionary.objects.select_related('subject').all()
    
    # Filtrar por materia si se proporciona
    subject_id = request.query_params.get('subject')
    if subject_id:
        words = words.filter(subject_id=subject_id)
    
    serializer = DigitalDictionarySerializer(words, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_dictionary_create(request):
    """Crear una nueva palabra en el diccionario"""
    serializer = DigitalDictionarySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def api_dictionary_detail(request, word_id, subject_id):
    """Obtener, actualizar o eliminar una palabra del diccionario"""
    try:
        word = DigitalDictionary.objects.get(word_id=word_id, subject_id=subject_id)
    except DigitalDictionary.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Palabra no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = DigitalDictionarySerializer(word)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'PUT':
        serializer = DigitalDictionarySerializer(word, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        word.delete()
        return Response({'success': True, 'message': 'Palabra eliminada'}, status=status.HTTP_204_NO_CONTENT)


# ============== RANKING ENDPOINTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_ranking_list(request):
    """Listar rankings"""
    rankings = Ranking.objects.select_related('subject').all()
    
    # Filtrar por materia si se proporciona
    subject_id = request.query_params.get('subject')
    if subject_id:
        rankings = rankings.filter(subject_id=subject_id)
    
    serializer = RankingSerializer(rankings, many=True)
    return Response({'success': True, 'data': serializer.data})


# ============== POSTS ENDPOINTS ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_post_list(request):
    """Listar todos los posts"""
    posts = Post.objects.select_related('user', 'user__person').all()
    serializer = PostSerializer(posts, many=True)
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_post_create(request):
    """Crear un nuevo post"""
    serializer = PostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============== TEST ENDPOINT ==============

@api_view(['GET'])
@permission_classes([AllowAny])
def api_test(request):
    """Endpoint de prueba para verificar que el API funciona"""
    return Response({
        'success': True,
        'message': 'API funcionando correctamente',
        'version': '1.0.0'
    })
