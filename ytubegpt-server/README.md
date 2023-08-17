## Description

YTube GPT - Chrome Extension Server

## Installation
Package Installation
```bash
$ yarn install
```
### Environment Setup
Create an `.env` file in the server root dir, and copy the variables from `.env.example`

From your Open AI dashboard, copy the secret key and paste here.
```env
OPENAI_API_KEY=<YOUR-KEY-HERE>
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

