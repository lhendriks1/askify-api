module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || 'postgresql://lydia_hendriks@localhost/askify-auth',
    JWT_SECRET: process.env.JWT_SECRET || 'akDlkjd90z1',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
  }