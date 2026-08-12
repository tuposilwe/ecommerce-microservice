CREATE TABLE product_images
(
    product_id   BIGINT PRIMARY KEY,
    image        BYTEA       NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    CONSTRAINT product_images_products_id_fk
        FOREIGN KEY (product_id) REFERENCES products (id)
            ON DELETE CASCADE
);
