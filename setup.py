# Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
# Bespoke Link to Instruments and Small Satellites (BLISS)
#
# Copyright 2017, by the California Institute of Technology. ALL RIGHTS
# RESERVED. United States Government Sponsorship acknowledged. Any
# commercial use must be negotiated with the Office of Technology Transfer
# at the California Institute of Technology.
#
# This software may be subject to U.S. export control laws. By accepting
# this software, the user agrees to comply with all applicable U.S. export
# laws and regulations. User has the responsibility to obtain export licenses
# or other export authority as may be required before exporting such
# information to foreign countries or providing access to foreign persons.

from setuptools import setup, find_packages
from setuptools.command.install import install
from setuptools.command.develop import develop

import os
import subprocess

def install_ui_deps():
    try:
        FNULL = open(os.devnull, 'wb')
        subprocess.check_call("npm", stdout=FNULL, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError:
        print subprocess.check_output("cd bliss/gui/static; npm install", shell=True)
    except OSError:
        print "Unable to locate npm on system. Skipping dependency installation"
    finally:
        FNULL.close()

class CustomDevelopCmd(develop):
    user_options = develop.user_options + [
        ('with-ui-deps=', None, "Toggle UI dependency installation")
    ]

    def initialize_options(self):
        develop.initialize_options(self)
        self.with_ui_deps = False

    def finalize_options(self):
        develop.finalize_options(self)

    def run(self):
        if self.with_ui_deps:
            print "UI Dependency installation requested. Running ..."
            install_ui_deps()
        else:
            print "UI Dependency installation not requested. Skipping ..."

        develop.run(self)


class CustomInstallCmd(install):
    user_options = install.user_options + [
        ('with-ui-deps=', None, "Toggle UI dependency installation")
    ]

    def initialize_options(self):
        install.initialize_options(self)
        self.with_ui_deps = False

    def finalize_options(self):
        install.finalize_options(self)

    def run(self):
        if self.with_ui_deps:
            print "UI Dependency installation requested. Running ..."
            install_ui_deps()
        else:
            print "UI Dependency installation not requested. Skipping ..."

        install.run(self)


setup(
    name = 'bliss-gui',
    version = '0.18.0',
    packages = find_packages(exclude=['tests']),
    author = 'BLISS-Core Development Team',
    author_email = 'bliss@jpl.nasa.gov',

    namespace_packages   = ['bliss'],
    include_package_data = True,

    install_requires = ['bliss-core>=0.31.0'],
    dependency_links = [
       'https://bliss.jpl.nasa.gov/pypi/simple/bliss-core/'
    ],
    extras_require = {
        'docs':  [
            'Sphinx',
            'sphinx_rtd_theme',
            'sphinxcontrib-httpdomain'
        ]
    },

    cmdclass = {
        "install": CustomInstallCmd,
        "develop": CustomDevelopCmd,
    },

    entry_points = {
        'console_scripts': [
            '{}=bliss.gui.bin.{}:main'.format(
                f.split('.')[0].replace('_', '-'),
                f.split('.')[0])
            for f in os.listdir('./bliss/gui/bin')
            if f.endswith('.py') and
            f != '__init__.py'
        ]
    }
)
