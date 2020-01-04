FROM node:latest
WORKDIR /app
EXPOSE 4000
ENV PUBLIC_URL https://localminimum.se/exercisor
RUN ["npm", "install", "-g", "serve"]
COPY package.json .
COPY package-lock.json .
RUN ["npm", "install"]
COPY public/ public/
COPY src/ src/
RUN ["npm", "run", "build"]
ENTRYPOINT ["serve", "-s", "build", "-l", "4000"]
