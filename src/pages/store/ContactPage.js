import React from 'react';
import ContactUs from '../../components/contact-us/ContactUs';
import AnimatedBackground from '../../components/admin/AnimatedBackground';
import '../../styles/contactUs.css'; // Import the additional CSS styles

const ContactPage = () => {
  return (
    <AnimatedBackground section="contact" className="min-h-screen">
      <ContactUs />
    </AnimatedBackground>
  );
};

export default ContactPage;