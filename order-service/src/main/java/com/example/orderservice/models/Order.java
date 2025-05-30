package com.example.orderservice.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Builder
@Getter
@Setter
@Entity(name = "orders")
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    private Long userId;

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @ToString.Exclude
    @OneToMany(mappedBy = "order",
               fetch = FetchType.LAZY,
               cascade = CascadeType.ALL)
    private List<OrderProduct> products;

    public void setProducts(List<OrderProduct> products) {
        this.products = products;
    }

    @CreationTimestamp
    @Column(nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || this.getClass() != o.getClass()) {
            return false;
        }
        var user = (Order) o;
        return this.id.equals(user.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }
}
