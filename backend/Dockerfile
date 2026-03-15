# UGROW Backend Dockerfile
# Python FastAPI with Excel processing capabilities

# ============================================
# Base Image
# ============================================
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for Excel processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Required for pandas/numpy
    gcc \
    g++ \
    # Required for xlrd (legacy Excel)
    libxml2-dev \
    libxslt1-dev \
    # Required for cryptography
    libffi-dev \
    libssl-dev \
    # General utilities
    curl \
    # Clean up
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ============================================
# Dependencies Stage
# ============================================
FROM base AS deps

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ============================================
# Production Stage
# ============================================
FROM base AS production

WORKDIR /app

# Create non-root user
RUN groupadd -r ugrow && useradd -r -g ugrow ugrow

# Copy Python dependencies from deps stage
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/storage /app/exports /app/templates /app/logs && \
    chown -R ugrow:ugrow /app

# Switch to non-root user
USER ugrow

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# ============================================
# Development Stage (Optional)
# ============================================
FROM deps AS development

WORKDIR /app

# Install development dependencies
RUN pip install --no-cache-dir pytest pytest-asyncio httpx black isort mypy

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Development command with auto-reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]