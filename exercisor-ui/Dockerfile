FROM node:latest
WORKDIR /app
RUN ["npm", "install", "-g", "serve"]
COPY package.json .
COPY package-lock.json .
RUN ["npm", "install"]
COPY public/ public/
COPY src/ src/
RUN ["npm", "run", "build"]
EXPOSE 4000
ENTRYPOINT ["serve", "-s", "build", "-l", "4000", "-d"]
