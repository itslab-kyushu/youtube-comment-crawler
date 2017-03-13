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
if [[ $# == 0 ]]; then
  exec /bin/bash
fi

/root/bin/cli.js $@
