package com.rudiger.order.repositories;

import com.rudiger.order.entities.Order;
import com.rudiger.order.entities.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = "items")
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId")
    List<Order> getOrdersByCustomer(@Param("customerId") Long customerId);

    @EntityGraph(attributePaths = "items")
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    Optional<Order> getOrderWithItems(@Param("orderId") Long orderId);

    @EntityGraph(attributePaths = "items")
    Page<Order> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = "items")
    Page<Order> findAllByStatus(PaymentStatus status, Pageable pageable);
}
