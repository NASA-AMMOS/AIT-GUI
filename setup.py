from setuptools import setup, find_packages
from setuptools.command.install import install
from setuptools.command.develop import develop

import os
import subprocess

def extra_install_tasks(cmd_cls):
    """"""
    orig_run = cmd_cls.run

    def extras_run(self):
        try:
            subprocess.check_call("npm")
        except subprocess.CalledProcessError:
            print subprocess.check_output("cd bliss/gui; npm install", shell=True)
        except OSError:
            print "Unable to locate npm on system. Skipping dependency installation"

        orig_run(self)

    cmd_cls.run = extras_run
    return cmd_cls

@extra_install_tasks
class CustomDevelopCmd(develop):
    pass

@extra_install_tasks
class CustomInstallCmd(install):
    pass


setup(
    name         = 'bliss-gui',
    version      = '0.1.0',
    packages     = ['bliss'],
    author       = 'BLISS-Core Development Team',
    author_email = 'bliss@jpl.nasa.gov',

    include_package_data = True,

    scripts = ['./bin/bliss_gui.py'],
    install_requires = ['bliss-core'],

    cmdclass = {
        "install": CustomInstallCmd,
        "develop": CustomDevelopCmd,
    }
)
