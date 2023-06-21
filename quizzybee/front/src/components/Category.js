import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Category.css";

function Category() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/categories"
        );
        setCategories(response.data);
        console.log("Retrieved categories:", response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (category) => {
    localStorage.setItem(
      "selectedCategory",
      JSON.stringify(category.categorie)
    );
  };

  return (
    <div className="category-container">
      <h1 className="title">Categories</h1>
      <ul className="category-box">
        {categories.map((category) => (
          <li className="category-list" key={category.id}>
            <Link
              className="category-link"
              to="/questions"
              onClick={() => handleCategorySelect(category)}
            >
              {category.categorie}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Category;
