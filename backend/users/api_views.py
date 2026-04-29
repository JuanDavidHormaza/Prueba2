from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Count

from .Models.models import CustomUser
from .Models.modelsSENA import Person, User, Subject, DigitalDictionary, Post, Ranking
from .serializers import (
    PersonSerializer, UserSerializer, SubjectSerializer,
    DigitalDictionarySerializer, CustomUserSerializer,
    RegisterSerializer, LoginSerializer, PostSerializer, RankingSerializer
)


# ============== AUTH VIEWS ==============

class RegisterView(generics.CreateAPIView):
    """
    Registro de nuevos usuarios.
    Crea Person, User (modelsSENA) y CustomUser (auth).
    """
    queryset = CustomUser.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': CustomUserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Usuario registrado exitosamente.'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Login con email y password.
    Retorna tokens JWT y datos del usuario.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Try to find user by email
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Credenciales inválidas.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        if not user.check_password(password):
            return Response({
                'error': 'Credenciales inválidas.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Usuario inactivo.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': CustomUserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserProfileView(APIView):
    """
    Obtener y actualizar perfil del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ============== VIEWSETS ==============

class PersonViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para Person.
    """
    queryset = Person.objects.all().order_by('-created_at')
    serializer_class = PersonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Person.objects.all().order_by('-created_at')
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para User (modelsSENA).
    """
    queryset = User.objects.all().select_related('person').order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.all().select_related('person').order_by('-created_at')
        role = self.request.query_params.get('role')
        status = self.request.query_params.get('status')
        
        if role:
            queryset = queryset.filter(role_id=role)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        # First create Person if person data is provided
        person_data = request.data.get('person')
        if person_data:
            person_serializer = PersonSerializer(data=person_data)
            person_serializer.is_valid(raise_exception=True)
            person = person_serializer.save()
            request.data['person_id'] = person.person_id
        
        return super().create(request, *args, **kwargs)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para Subject.
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class DigitalDictionaryViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para DigitalDictionary.
    """
    queryset = DigitalDictionary.objects.all().select_related('subject')
    serializer_class = DigitalDictionarySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = DigitalDictionary.objects.all().select_related('subject')
        subject_id = self.request.query_params.get('subject')
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        subject_id = request.data.get('subject_id')
        if subject_id:
            try:
                Subject.objects.get(subject_id=subject_id)
            except Subject.DoesNotExist:
                return Response({
                    'error': f'Subject {subject_id} no existe.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class PostViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para Post.
    """
    queryset = Post.objects.all().select_related('user', 'user__person').order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]


class RankingViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para Ranking.
    """
    queryset = Ranking.objects.all().select_related('subject')
    serializer_class = RankingSerializer
    permission_classes = [IsAuthenticated]


# ============== STATS/DASHBOARD VIEWS ==============

class DashboardStatsView(APIView):
    """
    Estadísticas para el dashboard.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get counts
        total_users = User.objects.count()
        total_persons = Person.objects.count()
        total_subjects = Subject.objects.count()
        total_dictionary = DigitalDictionary.objects.count()
        
        # Users by role
        users_by_role = User.objects.values('role_id').annotate(count=Count('user_id'))
        
        # Users by status
        users_by_status = User.objects.values('status').annotate(count=Count('user_id'))
        
        # Persons by status
        persons_by_status = Person.objects.values('status').annotate(count=Count('person_id'))
        
        # Recent users
        recent_users = UserSerializer(
            User.objects.select_related('person').order_by('-created_at')[:5],
            many=True
        ).data
        
        return Response({
            'totals': {
                'users': total_users,
                'persons': total_persons,
                'subjects': total_subjects,
                'dictionary': total_dictionary,
            },
            'users_by_role': list(users_by_role),
            'users_by_status': list(users_by_status),
            'persons_by_status': list(persons_by_status),
            'recent_users': recent_users,
            'current_user': CustomUserSerializer(user).data,
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_email(request):
    """
    Buscar usuario por email.
    """
    email = request.query_params.get('email')
    if not email:
        return Response({'error': 'Email requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        person = Person.objects.get(email=email)
        user = User.objects.filter(person=person).first()
        
        return Response({
            'person': PersonSerializer(person).data,
            'user': UserSerializer(user).data if user else None,
        })
    except Person.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
