import os
from . import app

app.run(
    os.environ.get("EXERCISOR_HOST", "127.0.0.1"),
    int(os.environ.get("EXERCISOR_PORT", "5000")),
)
