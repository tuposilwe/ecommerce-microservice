CREATE TABLE users
(
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name     VARCHAR(255)         NOT NULL,
    email    VARCHAR(255)         NOT NULL,
    password VARCHAR(255)         NOT NULL,
    role     VARCHAR(20) DEFAULT 'USER' NOT NULL
);
