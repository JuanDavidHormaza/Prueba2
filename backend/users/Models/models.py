from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model for JWT authentication.
    Links to the Person model from modelsSENA.
    """
    person = models.OneToOneField(
        'users.Person', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='custom_user'
    )
    
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('APRENDIZ', 'Aprendiz'),
        ('MONITOR', 'Monitor'),
        ('INSTRUCTOR', 'Instructor'),
    ]
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='APRENDIZ')
    
    class Meta:
        db_table = 'users_customuser'
    
    def __str__(self):
        return self.email or self.username
