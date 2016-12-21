##################
# Dockerfile mysql
##################

FROM alpine
MAINTAINER Alexander Eck-Zimmer "alexander-eck-zimmer@siemens.com"
ENV REFRESHED_AT 2015-12-16

LABEL description="Mysql server"

ENV http_proxy  http://172.17.42.1:3128
ENV https_proxy  http://172.17.42.1:3128

# install mysql server
RUN apk update && apk add mariadb mariadb-client && rm -rf /var/cache/apk/*

VOLUME ["/var/lib/mysql"]

ENV TERM ansi

ADD startup /startup
RUN chmod 700 /startup
CMD ["/startup"]

EXPOSE 3306
