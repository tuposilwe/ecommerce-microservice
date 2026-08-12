package com.rudiger.catalog.repositories;

import com.rudiger.catalog.entities.Category;
import org.springframework.data.repository.CrudRepository;

public interface CategoryRepository extends CrudRepository<Category, Byte> {
}
