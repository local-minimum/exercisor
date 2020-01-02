FROM node:latest
WORKDIR /app
COPY package.json .
RUN ["npm", "install"]
COPY public .
COPY src .
RUN ["npm", "run", "build"]
EXPOSE 8081
ENTRYPOINT ["node", "dist/index.html"]