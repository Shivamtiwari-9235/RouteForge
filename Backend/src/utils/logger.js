const format = (level, ...messages) => {
  const timestamp = new Date().toISOString();
  const output = messages.map((message) => {
    if (message instanceof Error) {
      return `${message.message}${message.stack ? '\n' + message.stack : ''}`;
    }
    if (typeof message === 'object') {
      return JSON.stringify(message, null, 2);
    }
    return message;
  });
  return `[${timestamp}] [${level}] ${output.join(' ')}`;
};

export const logger = {
  info: (...messages) => console.info(format('INFO', ...messages)),
  warn: (...messages) => console.warn(format('WARN', ...messages)),
  error: (...messages) => console.error(format('ERROR', ...messages))
};
