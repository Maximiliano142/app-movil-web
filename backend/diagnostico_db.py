"""Diagnóstico de la tabla usuarios y de las tablas que la referencian.
SOLO LEE la base (no modifica nada). Uso, dentro de backend/ con el venv activado:
    python manage.py shell < diagnostico_db.py
"""
from django.db import connection

c = connection.cursor()


def q(titulo, sql):
    print(f"\n== {titulo}")
    try:
        c.execute(sql)
        for fila in c.fetchall():
            print("  ", fila)
    except Exception as e:  # noqa: BLE001
        connection.rollback()
        print("   ERROR:", e)


q("Clave primaria de usuarios", """
    select kcu.column_name from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name and tc.table_name = kcu.table_name
    where tc.table_name = 'usuarios' and tc.constraint_type = 'PRIMARY KEY'""")
q("Tipo de usuarios.documento", """
    select data_type, character_maximum_length, is_nullable from information_schema.columns
    where table_name = 'usuarios' and column_name = 'documento'""")
q("Usuarios (documento, username)", "select documento, username, is_superuser from usuarios order by date_joined")
q("Claves foráneas que apuntan a usuarios", """
    select conrelid::regclass as tabla, conname, pg_get_constraintdef(oid)
    from pg_constraint where confrelid = 'usuarios'::regclass""")
for tabla in ["usuarios_groups", "usuarios_user_permissions", "usuariosxcuestionarios", "encuestas",
              "cuestionarios", "django_admin_log", "django_session", "bitacora", "avisos"]:
    q(f"Columnas de {tabla}", f"""
        select column_name, data_type from information_schema.columns
        where table_name = '{tabla}' order by ordinal_position""")
q("Valores en usuarios_groups", "select * from usuarios_groups limit 10")
q("Valores en usuariosxcuestionarios", "select * from usuariosxcuestionarios limit 10")
q("Tablas con columnas de usuario", """
    select table_name, column_name, data_type from information_schema.columns
    where table_schema = 'public' and (column_name like '%usuario%' or column_name in ('user_id', 'creado_por'))
    order by table_name""")
print("\nListo.")
