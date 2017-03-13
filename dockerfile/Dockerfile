#
# Dockerfile
#
# Copyright (c) 2016-2017 Junpei Kawamoto
#
# This software is released under the MIT License.
#
# http://opensource.org/licenses/mit-license.php
#
FROM node:wheezy
MAINTAINER Junpei Kawamoto <kawamoto.junpei@gmail.com>

VOLUME /data
WORKDIR /root
RUN npm update npm

ADD package.json .
RUN npm install
COPY . .

ENTRYPOINT ["/root/dockerfile/entrypoint.sh"]
CMD ["--id", "/data/ids.json", "--comment", "/data/comments.json"]
