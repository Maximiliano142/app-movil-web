"""usuarios: la clave primaria pasa a ser el documento (se quitó la columna id).

El cambio ya se hizo a mano en la base de Neon, así que esta migración solo
actualiza el estado de Django (no ejecuta SQL). Para una base nueva, aplicarla y
cambiar la tabla de la misma forma que en Neon.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0028_perfil_foto_usuarios_y_backup"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(model_name="usuario", name="id"),
                migrations.AlterField(
                    model_name="usuario",
                    name="documento",
                    field=models.CharField(max_length=30, primary_key=True, serialize=False),
                ),
            ],
            database_operations=[],
        ),
    ]
