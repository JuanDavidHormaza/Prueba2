# This file acts as a facade to expose views from the Controllers folder
# Required because urls.py imports `from . import views`

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .Models.modelsSENA import Person, User, Subject, DigitalDictionary
from .serializers import (
    PersonSerializer, UserSerializer, SubjectSerializer, DigitalDictionarySerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def person_list(request):
    """
    Lista todas las personas.
    """
    persons = Person.objects.all().order_by('-created_at')
    serializer = PersonSerializer(persons, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def person_create(request):
    """
    Crea una nueva persona.
    """
    serializer = PersonSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_list(request):
    """
    Lista todos los usuarios.
    """
    users = User.objects.all().select_related('person').order_by('-created_at')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def subject_list(request):
    """
    Lista todas las asignaturas.
    """
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def dictionary_list(request):
    """
    Lista todas las palabras del diccionario.
    """
    words = DigitalDictionary.objects.all().select_related('subject')
    serializer = DigitalDictionarySerializer(words, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dictionary_create(request):
    """
    Crea una nueva palabra en el diccionario.
    """
    serializer = DigitalDictionarySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
