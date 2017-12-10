#!/usr/bin/python
import os

virtenv = os.path.join(os.getenv('OPENSHIFT_PYTHON_DIR', '.'), 'virtenv')
virtualenv = os.path.join(virtenv, 'bin/activate_this.py')

try:

    exec_namespace = dict(__file__=virtualenv)

    with open(virtualenv, 'rb') as exec_file:

        file_contents = exec_file.read()

    compiled_code = compile(file_contents, virtualenv, 'exec')

    exec(compiled_code, exec_namespace)

except IOError:

    pass

#
# IMPORTANT: Put any additional includes below this line.  If placed above this
# line, it's possible required libraries won't be in your searchable path
#

from backend import app as application

#
# Below for testing only
#

if __name__ == '__main__':
    from wsgiref.simple_server import make_server

    httpd = make_server('localhost', 8051, application)

    # Wait for a single request, serve it and quit.
    httpd.serve_forever()
