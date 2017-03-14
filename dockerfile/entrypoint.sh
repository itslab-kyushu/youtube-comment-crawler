#!/bin/bash
#
# entrypoint.sh
#
# Copyright (c) 2016-2017 Junpei Kawamoto
#
# This software is released under the MIT License.
#
# http://opensource.org/licenses/mit-license.php
#

# Entrypoint of docker containers.
# For debugging, if the first argument is "bash", start bash.
#
if [[ $1 == "bash" ]]; then
  exec /bin/bash
fi
/root/bin/cli.js --dir /data $@
