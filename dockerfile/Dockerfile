#
# Dockerfile
#
# Copyright (c) 2017 Junpei Kawamoto
#
# This file is part of sss.
#
# sss is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# sss is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with sss.  If not, see <http://www.gnu.org/licenses/>.
#

FROM node:wheezy
MAINTAINER Junpei Kawamoto <kawamoto.junpei@gmail.com>

VOLUME /data
WORKDIR /root
RUN npm update npm

ADD package.json .
RUN npm install
COPY . .

ENTRYPOINT ["/bin/bash"]
CMD ["./bin/cli.js", "--id", "/data/ids.json", "--comment", "/data/comments.json"]
