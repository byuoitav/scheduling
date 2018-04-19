FROM python:alpine
MAINTAINER Daniel Randall <danny_randall@byu.edu>

# add deps
RUN apk --no-cache update
RUN apk --no-cache --virtual .build-deps add build-base libffi-dev libxml2-dev openssl-dev libxslt-dev && \
    pip install maya flask flask_cors flask_restplus exchangelib && \
    apk del .build-deps

# add any required files/folders here
COPY server.py server.py
COPY dbo.py dbo.py
COPY exchange exchange
COPY web-dist web-dist

ENTRYPOINT export FLASK_APP="server.py" && flask run --host=0.0.0.0
