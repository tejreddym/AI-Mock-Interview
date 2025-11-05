# Security

This document outlines the security measures implemented in the AI Mock Interview platform.

## Security Features

### 1. Rate Limiting

The application implements three levels of rate limiting:

- **General Limiter**: 100 requests per 15 minutes per IP for all routes
- **Auth Limiter**: 5 authentication attempts per 15 minutes per IP to prevent brute force attacks
- **Interview Limiter**: 30 requests per minute per IP for interview operations

### 2. NoSQL Injection Prevention

- **express-mongo-sanitize** middleware sanitizes user input by removing any keys that start with `$` or contain `.`
- All MongoDB queries are protected against NoSQL injection attacks
- User input in authentication (email, password) is sanitized before database queries

### 3. Input Validation

- Array indices are validated as integers before use to prevent prototype pollution
- Request body size is limited to 10MB to prevent DoS attacks
- Mongoose schemas enforce data types and required fields

### 4. Authentication & Authorization

- **JWT (JSON Web Tokens)** for stateless authentication
- Passwords are hashed using **bcryptjs** with salt rounds of 12
- Password minimum length: 6 characters
- JWT tokens expire after 30 days
- Protected routes require valid JWT token in Authorization header

### 5. CORS Configuration

- CORS is configured to only allow requests from the frontend URL
- Credentials are enabled for cookie-based authentication (if needed in future)

### 6. Dependency Security

- All dependencies are regularly checked for known vulnerabilities
- Axios updated to version 1.12.0+ to fix SSRF and DoS vulnerabilities
- Using latest stable versions of security-critical packages

## CodeQL Analysis Results

The codebase has been analyzed using GitHub CodeQL security scanning. The following alerts were identified and addressed:

### Resolved Issues

1. ✅ **Missing Rate Limiting** (16 alerts) - RESOLVED
   - Added rate limiting middleware to all routes
   - Implemented different limits for auth and regular operations

2. ✅ **Prototype Pollution** (4 alerts) - RESOLVED
   - Added input validation for array indices
   - Ensured indices are integers before use
   - Protected against malicious `__proto__` injection

### False Positives

1. ⚠️ **NoSQL Injection in Auth Controller** (2 alerts) - FALSE POSITIVE
   - Location: `authController.js` lines 9 and 57
   - Context: Using email field in MongoDB queries for user lookup
   - Why it's safe:
     - `express-mongo-sanitize` middleware strips out NoSQL operators (`$`, `.`)
     - Email is validated by Mongoose schema as a string
     - This is standard practice for user authentication
     - No user input is directly used in query operators

## Best Practices

### For Developers

1. **Never commit secrets** to version control
2. **Always use environment variables** for sensitive configuration
3. **Validate and sanitize** all user input
4. **Keep dependencies updated** regularly
5. **Use rate limiting** on all public endpoints
6. **Implement proper error handling** without exposing sensitive information

### For Deployment

1. **Use strong JWT secrets** (at least 32 random characters)
2. **Enable HTTPS** on production servers
3. **Use MongoDB Atlas** with IP whitelisting and authentication
4. **Set secure CORS origins** to your actual frontend URL
5. **Monitor rate limit violations** for potential attacks
6. **Implement logging** for security events

## Environment Variables Security

Required secure environment variables:

### Backend
```
JWT_SECRET=<strong-random-string-32-chars-minimum>
MONGODB_URI=<mongodb-connection-string-with-auth>
GEMINI_API_KEY=<your-gemini-api-key>
FRONTEND_URL=<your-frontend-url>
```

### Frontend
```
VITE_API_URL=<your-backend-url>
```

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly instead of opening a public issue. Security issues will be addressed with high priority.

## Security Checklist for Production

- [ ] Generate strong JWT_SECRET
- [ ] Use MongoDB Atlas with authentication
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Set secure environment variables
- [ ] Review and update dependencies
- [ ] Monitor application logs
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Implement backup strategy for database
- [ ] Set up monitoring and alerting

## Future Security Enhancements

- [ ] Implement refresh tokens
- [ ] Add email verification
- [ ] Implement two-factor authentication (2FA)
- [ ] Add session management
- [ ] Implement API key rotation
- [ ] Add request signing
- [ ] Implement CSRF protection for future cookie-based auth
- [ ] Add IP-based blocking for repeated violations
- [ ] Implement audit logging
- [ ] Add automated security testing in CI/CD

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
