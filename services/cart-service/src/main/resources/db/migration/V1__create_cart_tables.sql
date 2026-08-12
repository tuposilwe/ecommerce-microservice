CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE carts
(
    id           UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    date_created DATE DEFAULT CURRENT_DATE       NOT NULL
);

CREATE TABLE cart_items
(
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id       UUID           NOT NULL,
    product_id    BIGINT         NOT NULL,
    product_name  VARCHAR(255)   NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity      INT DEFAULT 1  NOT NULL,
    CONSTRAINT cart_items_cart_product_unique
        UNIQUE (cart_id, product_id),
    CONSTRAINT cart_items_carts_id_fk
        FOREIGN KEY (cart_id) REFERENCES carts (id)
            ON DELETE CASCADE
);
