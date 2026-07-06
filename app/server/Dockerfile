FROM python:3.9
WORKDIR /server
RUN pip install mysql-connector-python fastapi uvicorn
COPY server.py .
EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
