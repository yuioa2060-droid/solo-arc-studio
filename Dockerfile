FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg python3 python3-venv git git-lfs ca-certificates \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpangocairo-1.0-0 libcups2 libgtk-3-0 fonts-liberation \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY scripts ./scripts
COPY episodes/ep1-v11/film ./episodes/ep1-v11/film
COPY skills/solo-arc-motion ./skills/solo-arc-motion
COPY README.md AGENTS.md ./
RUN npm run browser:ensure
EXPOSE 3000
CMD ["npm", "run", "studio", "--", "--port=3000"]
