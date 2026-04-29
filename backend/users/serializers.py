from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
from .Models.models import CustomUser
from .Models.modelsSENA import Person, Subject, DigitalDictionary, Ranking, Post, TestResult


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = [
            'person_id', 'email', 'doc_type', 'doc_num',
            'first_name', 'last_name', 'phone_num', 'status', 'created_at'
        ]
        read_only_fields = ['person_id', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class UserSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'role', 'person',
            'full_name', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users with person data."""
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    doc_type = serializers.CharField(write_only=True, required=False, default='CC')
    doc_num = serializers.CharField(write_only=True)
    phone_num = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    program = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password', 'role',
            'first_name', 'last_name', 'doc_type', 'doc_num', 'phone_num', 'program'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        # Extract person data
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        doc_type = validated_data.pop('doc_type', 'CC')
        doc_num = validated_data.pop('doc_num')
        phone_num = validated_data.pop('phone_num', None)
        validated_data.pop('program', None)  # Program is informational only
        
        # Create Person
        person = Person.objects.create(
            email=validated_data.get('email'),
            password=validated_data.get('password'),  # Will be hashed in CustomUser
            doc_type=doc_type,
            doc_num=doc_num,
            first_name=first_name,
            last_name=last_name,
            phone_num=phone_num,
            status='ACTIVO'
        )
        
        # Create CustomUser with hashed password
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['person'] = person
        validated_data['first_name'] = first_name
        validated_data['last_name'] = last_name
        
        user = CustomUser.objects.create(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that includes user role and permissions."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['email'] = user.email
        token['full_name'] = user.full_name
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'full_name': self.user.full_name,
            'permissions': self.get_permissions(self.user.role),
        }
        
        return data
    
    def get_permissions(self, role):
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


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['subject_id', 'description']


class DigitalDictionarySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.description', read_only=True)
    
    class Meta:
        model = DigitalDictionary
        fields = [
            'word_id', 'subject', 'subject_name', 'definition',
            'synonyms', 'audio', 'video', 'image'
        ]


class RankingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ranking
        fields = ['subject', 'word_id', 'level', 'value']


class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.person.first_name', read_only=True)
    
    class Meta:
        model = Post
        fields = ['post_id', 'user', 'user_name', 'title', 'body', 'status', 'created_at']
        read_only_fields = ['post_id', 'created_at']


class TestResultSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = TestResult
        fields = [
            'result_id', 'user', 'user_name', 'user_email',
            'score', 'level', 'correct_answers', 'total_questions',
            'answers', 'feedback', 'duration', 'completed_at'
        ]
        read_only_fields = ['result_id', 'completed_at']


class TestResultCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating test results (student submits test)."""
    
    class Meta:
        model = TestResult
        fields = [
            'score', 'level', 'correct_answers', 'total_questions',
            'answers', 'duration'
        ]
    
    def create(self, validated_data):
        # User comes from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
