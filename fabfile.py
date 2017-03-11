# pylint: skip-file
from fabric.api import *
from fabric.contrib.project import rsync_project
env.use_ssh_config = True

PACKAGE = "ycc"


@task
def build():
    """Build a Docker image.
    """
    run("mkdir -p " + PACKAGE)
    rsync_project(
        local_dir=".", remote_dir=PACKAGE, exclude=[".git", "node_modules", "lib", "data"])
    with cd(PACKAGE):
        run("docker build -t itslabq/{0} -f dockerfile/Dockerfile .".format(PACKAGE))


@task
def start():
    """Start crawling.
    """
    with cd(PACKAGE):
        run("docker run -d --name {0} -v $(pwd)/data:/data itslabq/{0}".format(PACKAGE))


@task
def stop():
    """Stop crawling.
    """
    run("docker stop {0}".format(PACKAGE))
    run("docker rm {0}".format(PACKAGE))
