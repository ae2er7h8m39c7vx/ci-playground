.PHONY: dev
dev:
	tail -n 20 data | node -r dotenv/config index