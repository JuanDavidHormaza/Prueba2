from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('APRENDIZ', 'Aprendiz'),
        ('MONITOR', 'Monitor'),
        ('INSTRUCTOR', 'Instructor'),
    ]
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='APRENDIZ')
    
    # Campos adicionales opcionales
    phone_num = models.CharField(max_length=20, null=True, blank=True)
    doc_type = models.CharField(max_length=5, null=True, blank=True)
    doc_num = models.CharField(max_length=50, null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} - {self.role}"
