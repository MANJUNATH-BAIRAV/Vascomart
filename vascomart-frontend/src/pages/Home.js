import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import '../styles/Home.css';

// Import images from assets
import heroImage from '../assets/images/hero.jpg';
import productsImage from '../assets/images/products.jpg';
import deliveryImage from '../assets/images/delivery.jpg';
const supportImage = 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'; // Support team image

const Home = () => {
  const services = [
    {
      id: 1,
      title: 'Wide Product Range',
      description: 'Discover a vast selection of high-quality products across multiple categories to meet all your needs in one place.',
      img: productsImage
    },
    {
      id: 2,
      title: 'Fast Delivery',
      description: 'Enjoy lightning-fast delivery services with real-time tracking to get your products when you need them.',
      img: deliveryImage
    },
    {
      id: 3,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you with any queries or concerns.',
      img: supportImage
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${heroImage})` }}>
        <div className="hero-content">
          <h1>Welcome to Vascomart</h1>
          <p>Your one-stop destination for all your shopping needs. Discover amazing products at unbeatable prices with exceptional service.</p>
          <div>
            <Link to="/products" className="cta-button">
              Shop Now <FiArrowRight className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="section-title">
          <h2>Our Services</h2>
          <p>We are committed to providing the best shopping experience with our premium services</p>
        </div>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div 
                className="service-img" 
                style={{ backgroundImage: `url(${service.img})` }}
              />
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="about-content">
          <div className="about-text">
            <h2>About Vascomart</h2>
            <p>Vascomart is a microservices-based e-commerce app built with Spring Boot, a React frontend, and PostgreSQL databases. It uses Kafka for async notifications and is fully containerized with Docker. All services are deployed and running in Kubernetes (Minikube), following real-world DevOps practices.</p>
            
            <div className="ceo-info">
              <h4>Manjunath Bairav M</h4>
              <p>Founder & CEO, Vascomart</p>
              <p>For business inquiries, contact: <a href="mailto:manjunathbairav1@gmail.com">manjunathbairav1@gmail.com</a></p>
            </div>
          </div>
          <div className="about-img">
            {/* Image will be set via CSS */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Experience the Best?</h2>
          <p>Join thousands of satisfied customers who trust Vascomart for their shopping needs. Sign up today and enjoy exclusive benefits!</p>
          <Link to="/register" className="cta-button">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Vascomart. All rights reserved.</p>
          <p>Contact us: <a href="mailto:manjunathbairav1@gmail.com">manjunathbairav1@gmail.com</a></p>
          <p>Designed with ❤️ for our valued customers</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
