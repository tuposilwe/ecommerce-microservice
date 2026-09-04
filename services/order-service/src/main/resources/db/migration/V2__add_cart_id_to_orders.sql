-- Remember which cart an order came from, so the cart can be emptied when
-- payment is confirmed rather than when the Stripe session is created.
-- Nullable: orders placed before this change have no cart recorded, and a
-- cart may legitimately be gone by the time payment lands.
ALTER TABLE orders
    ADD COLUMN cart_id UUID;
