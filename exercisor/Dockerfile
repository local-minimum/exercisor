FROM python:3.8
WORKDIR /app
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:5000"
EXPOSE 5000
RUN ["pip", "install", "gunicorn", "pipenv"]
COPY "Pipfile*" "./"
RUN ["pipenv", "install", "--deploy", "--system"]
COPY "*.py" "exercisor/"
COPY "api" "exercisor/"
COPY "transactions" "exercisor/"
CMD ["gunicorn", "exercisor:app"]
