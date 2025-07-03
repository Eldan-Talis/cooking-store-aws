import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaHeart, FaUtensils, FaRobot } from "react-icons/fa";
import "../style/Navbar.css";
import ChefHat from "../assets/chef.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">
        <img src={ChefHat} alt="ChefBot logo" className="brand-icon" />
        <span className="brand-text">ChefBot</span>
      </NavLink>

      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li>
          <NavLink to="/" end>
            <FaHome /> HomePage
          </NavLink>
        </li>
        <li>
          <NavLink to="/favorites">
            <FaHeart /> My Favorites
          </NavLink>
        </li>
        <li>
          <NavLink to="/recipes">
            <FaUtensils /> My Recipes
          </NavLink>
        </li>

        <li>
          <NavLink to="/chat">
            <FaRobot /> Chat Bot
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
