"""Encuestados, encuestas y asignaciones según la base de Neon:
- encuestados: la clave primaria es el documento (sin id_encuestado).
- encuestas: documento_encuestado y documento_usuario (antes id_encuestado e id_usuario).
- usuariosxcuestionarios: documento_usuario (antes id_usuario).

Los cambios ya están hechos en la base, así que esta migración solo actualiza
el estado de Django (no ejecuta SQL).
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0030_usuario_sin_groups"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(
                    model_name="encuestado",
                    name="id_encuestado",
                ),
                migrations.AlterField(
                    model_name="asignacioncuestionario",
                    name="usuario",
                    field=models.ForeignKey(
                        db_column="documento_usuario",
                        on_delete=django.db.models.deletion.PROTECT,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                migrations.AlterField(
                    model_name="encuesta",
                    name="encuestado",
                    field=models.ForeignKey(
                        db_column="documento_encuestado",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="encuestas",
                        to="core.encuestado",
                    ),
                ),
                migrations.AlterField(
                    model_name="encuesta",
                    name="usuario",
                    field=models.ForeignKey(
                        blank=True,
                        db_column="documento_usuario",
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="encuestas_cargadas",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                migrations.AlterField(
                    model_name="encuestado",
                    name="documento",
                    field=models.CharField(max_length=30, primary_key=True, serialize=False),
                ),
            ],
            database_operations=[],
        ),
    ]
