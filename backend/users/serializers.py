from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .Models.models import CustomUser
from .Models.modelsSENA import Person, User, Subject, DigitalDictionary, Post, Ranking


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = [
            'person_id', 'email', 'doc_type', 'doc_num',
            'first_name', 'last_name', 'phone_num', 'status', 'created_at'
        ]
        read_only_fields = ['person_id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    person_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'user_id', 'person', 'person_id', 'role_id', 
            'status', 'mfa', 'created_at'
        ]
        read_only_fields = ['user_id', 'created_at']


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['subject_id', 'description']


class DigitalDictionarySerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = DigitalDictionary
        fields = [
            'word_id', 'subject', 'subject_id', 'definition',
            'synonyms', 'audio', 'video', 'image'
        ]


class RankingSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    
    class Meta:
        model = Ranking
        fields = ['subject', 'word_id', 'level', 'value']


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = ['post_id', 'user', 'title', 'body', 'status', 'created_at']
        read_only_fields = ['post_id', 'created_at']


class CustomUserSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'person']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Person fields
    doc_type = serializers.ChoiceField(choices=Person.DOC_TYPES, required=True)
    doc_num = serializers.CharField(max_length=50, required=True)
    first_name = serializers.CharField(max_length=50, required=True)
    last_name = serializers.CharField(max_length=50, required=True)
    phone_num = serializers.IntegerField(required=False, allow_null=True)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, required=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password', 'password2',
            'doc_type', 'doc_num', 'first_name', 'last_name', 
            'phone_num', 'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        
        if Person.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Este email ya está registrado."})
        
        if Person.objects.filter(doc_num=attrs['doc_num']).exists():
            raise serializers.ValidationError({"doc_num": "Este número de documento ya está registrado."})
        
        return attrs
    
    def create(self, validated_data):
        # Extract person fields
        person_data = {
            'email': validated_data['email'],
            'password': validated_data['password'],  # This will be hashed in Person model if needed
            'doc_type': validated_data['doc_type'],
            'doc_num': validated_data['doc_num'],
            'first_name': validated_data['first_name'],
            'last_name': validated_data['last_name'],
            'phone_num': validated_data.get('phone_num'),
            'status': 'ACTIVO',
        }
        
        # Create Person
        person = Person.objects.create(**person_data)
        
        # Create User in modelsSENA
        User.objects.create(
            person=person,
            role_id=validated_data['role'],
            status='PENDIENTE',
            mfa=''
        )
        
        # Create CustomUser for JWT auth
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role'],
            person=person
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Las contraseñas no coinciden."})
        return attrs
