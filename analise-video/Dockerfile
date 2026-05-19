FROM python:3.10-slim

WORKDIR /app

# Instala dependências do sistema necessárias para OpenCV e WebRTC
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY requirements.txt .

# Instala as dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto da aplicação (incluindo o modelo YOLO)
COPY . .

# Expõe a porta do Streamlit
EXPOSE 8501

# Comando para iniciar o Streamlit
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
