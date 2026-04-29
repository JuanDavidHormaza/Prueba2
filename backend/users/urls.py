from django.urls import path
from . import api_views

urlpatterns = [
    # Auth
    path('auth/register/', api_views.register_user, name='register'),
    path('auth/profile/', api_views.get_profile, name='profile'),
    path('auth/profile/update/', api_views.update_profile, name='update_profile'),
    
    # Users (Admin)
    path('users/', api_views.list_users, name='list_users'),
    path('users/<int:user_id>/', api_views.get_user, name='get_user'),
    path('users/<int:user_id>/update/', api_views.update_user, name='update_user'),
    path('users/<int:user_id>/delete/', api_views.delete_user, name='delete_user'),
    
    # Subjects
    path('subjects/', api_views.list_subjects, name='list_subjects'),
    path('subjects/create/', api_views.create_subject, name='create_subject'),
    path('subjects/<str:subject_id>/update/', api_views.update_subject, name='update_subject'),
    path('subjects/<str:subject_id>/delete/', api_views.delete_subject, name='delete_subject'),
    
    # Digital Dictionary
    path('dictionary/', api_views.list_dictionary, name='list_dictionary'),
    path('dictionary/create/', api_views.create_dictionary_entry, name='create_dictionary_entry'),
    path('dictionary/<str:word_id>/<str:subject_id>/update/', api_views.update_dictionary_entry, name='update_dictionary_entry'),
    path('dictionary/<str:word_id>/<str:subject_id>/delete/', api_views.delete_dictionary_entry, name='delete_dictionary_entry'),
    
    # Test Results
    path('results/', api_views.list_test_results, name='list_test_results'),
    path('results/<int:result_id>/', api_views.get_test_result, name='get_test_result'),
    path('results/submit/', api_views.submit_test_result, name='submit_test_result'),
    path('results/<int:result_id>/feedback/', api_views.add_feedback, name='add_feedback'),
    
    # Statistics
    path('statistics/', api_views.get_statistics, name='statistics'),
]
