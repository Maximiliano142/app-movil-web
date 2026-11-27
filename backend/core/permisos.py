"""Permisos de cada usuario según su rol.

En la base no existen las tablas usuarios_groups ni usuarios_user_permissions:
cada usuario tiene un solo rol en usuarios.id_grupo (grupo de Django, tabla
auth_group) y sus permisos son los de ese rol (auth_group_permissions). El
superusuario tiene todos los permisos, como en Django.
"""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import Permission


class PermisosPorRol(ModelBackend):
    def _get_user_permissions(self, user_obj):
        # No hay permisos asignados directamente al usuario
        return Permission.objects.none()

    def _get_group_permissions(self, user_obj):
        if not user_obj.grupo_id:
            return Permission.objects.none()
        return Permission.objects.filter(group__pk=user_obj.grupo_id)
