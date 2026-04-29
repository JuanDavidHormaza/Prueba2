from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model for JWT authentication.
    Links to Person model for detailed personal information.
    """
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('teacher', 'Instructor'),
        ('student', 'Aprendiz'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    person = models.OneToOneField(
        'users.Person',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='custom_user'
    )
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    @property
    def full_name(self):
        if self.person:
            return f"{self.person.first_name} {self.person.last_name}"
        return self.get_full_name() or self.username
