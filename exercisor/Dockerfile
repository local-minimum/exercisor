FROM python:3.8
WORKDIR /app
RUN ["pip", "install", "gunicorn", "pipenv"]
COPY "Pipfile*" "./"
RUN ["pipenv", "install", "--deploy", "--system"]
COPY "*.py" "exercisor/"
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:5000"
EXPOSE 5000
CMD ["gunicorn", "exercisor:app"]
