from django.urls import path
from .Views.views import test_api
from .Views.views import perfil
from .Views.views import register
from . import views


# urlpatterns = [
#     path('test/', test_api),
#     path('perfil/', perfil),
#     path('register/', register),
# ]



urlpatterns = [
    path('persons/', views.person_list, name='person_list'),
    path('persons/create/', views.person_create, name='person_create'),

    path('users/', views.user_list, name='user_list'),

    path('subjects/', views.subject_list, name='subject_list'),

    path('dictionary/', views.dictionary_list, name='dictionary_list'),
    path('dictionary/create/', views.dictionary_create, name='dictionary_create'),
]