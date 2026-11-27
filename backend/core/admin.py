from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "campana", "is_staff")
    ordering = ("email",)
    search_fields = ("email", "first_name", "last_name", "documento")
    # Sin "groups" ni "user_permissions": el rol es el campo grupo (usuarios.id_grupo)
    filter_horizontal = ()
    list_filter = ("is_staff", "is_superuser", "is_active", "grupo")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Datos personales", {"fields": ("first_name", "last_name", "email")}),
        ("Permisos", {"fields": ("is_active", "is_staff", "is_superuser", "grupo")}),
        ("Fechas", {"fields": ("last_login", "date_joined")}),
    ) + (
        ("Campaña", {"fields": ("campana", "equipo")}),
        ("Datos de la persona", {"fields": ("documento", "telefono", "direccion")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("documento", "email", "username", "password1", "password2")}),
    )

