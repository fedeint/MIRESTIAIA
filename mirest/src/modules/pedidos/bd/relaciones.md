# Relaciones principales

- un `tenant` tiene muchos `restaurants`
- un `restaurant` tiene muchas `zones`, `tables`, `staff` y `orders`
- una `table` tiene muchos `orders`
- un `order` tiene muchos `order_items`
- un `order` puede tener muchas `rounds`
- una `round` tiene muchos `round_items`
- un `order` puede tener muchos `payments`
- un `payment` puede tener muchas `payment_proofs`
- un `order` puede derivar en `delivery_orders` o `takeaway_orders`
- una `credit_note` referencia un `order`
