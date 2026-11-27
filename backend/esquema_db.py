"""Muestra la estructura completa de la base (tablas, columnas, claves).
SOLO LEE: no modifica nada. Uso, dentro de backend/ con el venv activado:
    python manage.py shell < esquema_db.py > esquema.txt
"""
from django.db import connection

c = connection.cursor()
c.execute("""
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name""")
tablas = [r[0] for r in c.fetchall()]
for t in tablas:
    c.execute("""
        select column_name, data_type, is_nullable from information_schema.columns
        where table_schema = 'public' and table_name = %s order by ordinal_position""", [t])
    columnas = ", ".join(f"{n} {tipo}{'' if nulo == 'YES' else ' NOT NULL'}" for n, tipo, nulo in c.fetchall())
    c.execute("""
        select conname, pg_get_constraintdef(oid) from pg_constraint
        where conrelid = %s::regclass and contype in ('p', 'f', 'u') order by contype, conname""", [t])
    claves = [f"    {d}" for _, d in c.fetchall()]
    print(f"\n{t}: {columnas}")
    print("\n".join(claves))
print("\nTOTAL TABLAS:", len(tablas))
