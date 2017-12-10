import db, backend
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand

migrate(db, backend)

manager = Manager(backend)
manager.add_command('db', MigrateCommand)
