import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-logo">
                    <span>DELKAFILMS</span>
                </div>
                <div className="footer-copyright">
                    <p>&copy; {new Date().getFullYear()} Delkafilms. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
