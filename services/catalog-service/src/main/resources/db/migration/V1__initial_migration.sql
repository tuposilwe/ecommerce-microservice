CREATE TABLE categories
(
    id   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE products
(
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    description TEXT           NOT NULL,
    category_id SMALLINT NULL
);

ALTER TABLE products
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE NO ACTION;

CREATE INDEX fk_category_idx ON products (category_id);

CREATE TABLE product_images
(
    product_id   BIGINT PRIMARY KEY,
    image        BYTEA        NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    CONSTRAINT product_images_products_id_fk
        FOREIGN KEY (product_id) REFERENCES products (id)
            ON DELETE CASCADE
);
