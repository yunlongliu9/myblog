FROM python:3.12-slim
WORKDIR /app
COPY --chown=10001:10001 radar.py employers.tsv cities.tsv ./
COPY --chown=10001:10001 web ./web
RUN mkdir /app/data && chown 10001:10001 /app/data
USER 10001:10001
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["python", "radar.py", "--host", "0.0.0.0"]
