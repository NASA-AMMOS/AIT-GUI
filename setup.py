from setuptools import setup, find_packages

import os

setup(
    name         = 'bliss-gui',
    version      = '0.1.0',
    packages     = ['bliss'],
    author       = 'BLISS-Core Development Team',
    author_email = 'bliss@jpl.nasa.gov',

    include_package_data = True,

    scripts = ['./bin/bliss-gui'],
    install_requires = ['bliss-core'],
)
