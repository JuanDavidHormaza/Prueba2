from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api_views import (
    RegisterView, LoginView, UserProfileView, DashboardStatsView,
    PersonViewSet, UserViewSet, SubjectViewSet, DigitalDictionaryViewSet,
    PostViewSet, RankingViewSet, get_user_by_email
)

# Router para ViewSets
router = DefaultRouter()
router.register('persons', PersonViewSet, basename='person')
router.register('sena-users', UserViewSet, basename='sena-user')
router.register('subjects', SubjectViewSet, basename='subject')
router.register('dictionary', DigitalDictionaryViewSet, basename='dictionary')
router.register('posts', PostViewSet, basename='post')
router.register('rankings', RankingViewSet, basename='ranking')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    
    # Dashboard stats
    path('stats/', DashboardStatsView.as_view(), name='stats'),
    
    # Utility endpoints
    path('user-by-email/', get_user_by_email, name='user-by-email'),
    
    # Legacy endpoints (function-based views)
    path('legacy/persons/', views.person_list, name='person_list'),
    path('legacy/persons/create/', views.person_create, name='person_create'),
    path('legacy/users/', views.user_list, name='user_list'),
    path('legacy/subjects/', views.subject_list, name='subject_list'),
    path('legacy/dictionary/', views.dictionary_list, name='dictionary_list'),
    path('legacy/dictionary/create/', views.dictionary_create, name='dictionary_create'),
    
    # Router URLs (ViewSets)
    path('', include(router.urls)),
]
