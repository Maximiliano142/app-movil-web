"""usuarios: sin las tablas usuarios_groups y usuarios_user_permissions.

El rol es solo usuarios.id_grupo y los permisos salen de ese rol
(core/permisos.py). Las tablas ya no existen en la base de Neon, así que esta
migración solo actualiza el estado de Django (no ejecuta SQL).
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0029_usuario_pk_documento"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(model_name="usuario", name="groups"),
                migrations.RemoveField(model_name="usuario", name="user_permissions"),
            ],
            database_operations=[],
        ),
    ]
