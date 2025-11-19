FROM rust:1.86-slim

SHELL ["bash", "-c"]

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    protobuf-compiler \
    clang \
    make \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Linera toolchain
RUN cargo install --locked linera-service@0.15.5 linera-storage-service@0.15.5

# Install Node.js via NodeSource (more reliable than nvm in Docker)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# Copy project files
COPY . .

# Make dev script executable
RUN chmod +x /app/dev-setup.sh

# Health check for both backend and frontend
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health && curl -f http://localhost:5173/ || exit 1

# Set Docker mode environment variable
ENV DOCKER_MODE=1

# Start the development environment
CMD ["/app/dev-setup.sh"]