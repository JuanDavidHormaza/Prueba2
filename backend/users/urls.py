from django.urls import path
from .Views.views import test_api, perfil, register
from .Controllers.ControllerSENA import (
    person_list, person_create, user_list, 
    subject_list, dictionary_list, dictionary_create
)
from . import api_views


urlpatterns = [
    # ============== API REST ENDPOINTS ==============
    
    # Test
    path('test/', api_views.api_test, name='api_test'),
    
    # Auth endpoints
    path('auth/register/', api_views.register_user, name='api_register'),
    path('auth/login/', api_views.login_user, name='api_login'),
    path('auth/profile/', api_views.get_profile, name='api_profile'),
    path('auth/profile/update/', api_views.update_profile, name='api_profile_update'),
    
    # Persons API
    path('persons/', api_views.api_person_list, name='api_person_list'),
    path('persons/create/', api_views.api_person_create, name='api_person_create'),
    path('persons/<int:pk>/', api_views.api_person_detail, name='api_person_detail'),
    
    # Users API
    path('users/', api_views.api_user_list, name='api_user_list'),
    path('users/create/', api_views.api_user_create, name='api_user_create'),
    
    # Subjects API
    path('subjects/', api_views.api_subject_list, name='api_subject_list'),
    path('subjects/create/', api_views.api_subject_create, name='api_subject_create'),
    
    # Dictionary API
    path('dictionary/', api_views.api_dictionary_list, name='api_dictionary_list'),
    path('dictionary/create/', api_views.api_dictionary_create, name='api_dictionary_create'),
    path('dictionary/<str:word_id>/<str:subject_id>/', api_views.api_dictionary_detail, name='api_dictionary_detail'),
    
    # Rankings API
    path('rankings/', api_views.api_ranking_list, name='api_ranking_list'),
    
    # Posts API
    path('posts/', api_views.api_post_list, name='api_post_list'),
    path('posts/create/', api_views.api_post_create, name='api_post_create'),
    
    
    # ============== LEGACY TEMPLATE VIEWS ==============
    # Mantener para compatibilidad con templates HTML existentes
    path('legacy/persons/', person_list, name='legacy_person_list'),
    path('legacy/persons/create/', person_create, name='legacy_person_create'),
    path('legacy/users/', user_list, name='legacy_user_list'),
    path('legacy/subjects/', subject_list, name='legacy_subject_list'),
    path('legacy/dictionary/', dictionary_list, name='legacy_dictionary_list'),
    path('legacy/dictionary/create/', dictionary_create, name='legacy_dictionary_create'),
]
