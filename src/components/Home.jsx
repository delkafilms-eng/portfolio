import React from 'react';
import Hero from './Hero';
import FeaturedVideos from './FeaturedVideos';
import Gallery from './Gallery';
import About from './About';
import Contact from './Contact';

const Home = () => {
    return (
        <>
            <Hero />
            <FeaturedVideos />
            <Gallery />
            <About />
            <Contact />
        </>
    );
};

export default Home;
