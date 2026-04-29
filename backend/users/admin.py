from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .Models.models import CustomUser
from .Models.modelsSENA import Person, User, Subject, DigitalDictionary, Ranking, Post, UserLog


# Custom User Admin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'first_name', 'last_name', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = UserAdmin.fieldsets + (
        ('Informacion Adicional', {'fields': ('role', 'phone_num', 'doc_type', 'doc_num')}),
    )


# SENA Models Admin
@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('person_id', 'first_name', 'last_name', 'email', 'doc_type', 'doc_num', 'status')
    list_filter = ('status', 'doc_type')
    search_fields = ('first_name', 'last_name', 'email', 'doc_num')


@admin.register(User)
class UserSENAAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'person', 'role_id', 'status', 'created_at')
    list_filter = ('role_id', 'status')
    search_fields = ('person__first_name', 'person__last_name', 'person__email')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('subject_id', 'description')
    search_fields = ('subject_id', 'description')


@admin.register(DigitalDictionary)
class DigitalDictionaryAdmin(admin.ModelAdmin):
    list_display = ('word_id', 'subject', 'definition')
    list_filter = ('subject',)
    search_fields = ('word_id', 'definition', 'synonyms')


@admin.register(Ranking)
class RankingAdmin(admin.ModelAdmin):
    list_display = ('subject', 'word_id', 'level', 'value')
    list_filter = ('subject', 'level')


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('post_id', 'user', 'title', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'body')


@admin.register(UserLog)
class UserLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'transaction', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('transaction',)
