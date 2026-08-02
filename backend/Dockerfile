FROM python:3.11-slim

WORKDIR /app

# System deps needed by opencv / psycopg2. build-essential/cmake kept as a
# safety net in case any package ever needs to build from source, but the
# heavy compile step (dlib) is avoided entirely below via dlib-bin.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake \
    libgl1 libglib2.0-0 \
    libjpeg-dev libpng-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip

# Installed in separate layers on purpose: pip's dependency resolver (and
# the peak memory of whatever it's unpacking) only has to deal with one
# group at a time. Doing this all in a single `pip install` is what ran
# the free-tier build machine out of memory (>8GB) previously.
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir tensorflow-cpu==2.16.1
RUN pip install --no-cache-dir --no-deps face_recognition==1.3.0

COPY . .

RUN mkdir -p data/customers data/products data/reviews models_store

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]