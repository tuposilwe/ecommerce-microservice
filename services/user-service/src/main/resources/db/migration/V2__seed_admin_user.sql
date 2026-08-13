-- Local/demo admin account, since admin-gated catalog endpoints (product
-- create/update/delete/image) need a user with role=ADMIN and there's no
-- other way to get one without hand-editing the database. Password is
-- "admin123" (BCrypt-hashed) - change it (or delete this row) before any
-- non-local deployment.
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@example.com', '$2a$10$oASuv7m8VvVNSNpCaMqv.emSODcp6KG1YyTy45fiHtS5yKLXlrIwC', 'ADMIN');
