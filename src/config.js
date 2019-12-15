module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://lydia_hendriks@localhost/askify',
    JWT_SECRET: process.env.JWT_SECRET || 'akDlkjd90z1',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
  }