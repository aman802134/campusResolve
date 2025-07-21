import pino from 'pino';

// Create a Pino logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', // Pretty print for development
    options: { colorize: true },
  },
});

export default logger;
