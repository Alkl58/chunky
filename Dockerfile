FROM node:22-alpine

ENV UPLOAD_DIRECTORY=/data

WORKDIR /app

ADD *.js package.json package-lock.json /app/

ADD frontend /app/frontend
ADD middleware /app/middleware
ADD public /app/public
ADD routes /app/routes
ADD utils /app/utils

# Build frontend
RUN cd frontend && \
    npm ci && \
    npm run build && \
    cd .. && \
    mkdir /data && \
    chown node /data && \
    npm ci && \
    rm -rf frontend

EXPOSE 3000
VOLUME ["/data"]

USER node

CMD ["node", "server.js"]
