import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaQuestionCircle, 
  FaCalendarAlt, 
  FaCreditCard, 
  FaMapMarkerAlt, 
  FaUser, 
  FaShieldAlt, 
  FaHeadset,
  FaFileAlt,
  FaLightbulb,
  FaAngleRight,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
  FaRegThumbsUp,
  FaBook,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showChatbot, setShowChatbot] = useState(false);
  const [popularArticles, setPopularArticles] = useState([]);
  
  // Help Categories
  const categories = [
    { id: 'all', name: 'All Topics', icon: <FaQuestionCircle /> },
    { id: 'booking', name: 'Booking Help', icon: <FaCalendarAlt /> },
    { id: 'payment', name: 'Payments & Refunds', icon: <FaCreditCard /> },
    { id: 'venues', name: 'Venues & Events', icon: <FaMapMarkerAlt /> },
    { id: 'account', name: 'Account Settings', icon: <FaUser /> },
    { id: 'privacy', name: 'Privacy & Security', icon: <FaShieldAlt /> }
  ];
  
  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'How do I create an account?',
      answer: 'You can create an account by clicking the "Sign Up" button in the top right corner of the homepage. Fill in your details, verify your email, and you\'re ready to go!',
      category: 'account',
      popular: true
    },
    {
      id: 2,
      question: 'How do I book a venue?',
      answer: 'Browse venues on our platform, select the one you like, check availability for your preferred date, and click "Book Now". Follow the booking wizard to complete your reservation.',
      category: 'booking',
      popular: true
    },
    {
      id: 3,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, and net banking. All payments are securely processed.',
      category: 'payment',
      popular: false
    },
    {
      id: 4,
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking through your account dashboard. Please note that cancellation policies vary by venue and are clearly stated before you complete your booking.',
      category: 'booking',
      popular: true
    },
    {
      id: 5,
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security very seriously. Your personal information is encrypted and stored securely. We never share your data with unauthorized third parties.',
      category: 'privacy',
      popular: false
    },
    {
      id: 6,
      question: 'How can I update my profile information?',
      answer: 'Go to your account settings by clicking on your profile icon in the top right corner, then select "Profile". From there, you can edit your personal information.',
      category: 'account',
      popular: false
    },
    {
      id: 7,
      question: 'What if the venue is not as described?',
      answer: 'If you find any discrepancy between the venue description and reality, please contact our support team immediately with photos and details of the issue.',
      category: 'venues',
      popular: false
    },
    {
      id: 8,
      question: 'How do I get a refund?',
      answer: 'Refunds are processed according to the cancellation policy of the venue. If you\'re eligible for a refund, it will be processed back to your original payment method within 5-7 business days.',
      category: 'payment',
      popular: true
    },
    {
      id: 9,
      question: 'Can I change the date of my booking?',
      answer: 'Date changes are subject to venue availability and policies. Contact the venue directly or our support team to request a date change.',
      category: 'booking',
      popular: false
    },
    {
      id: 10,
      question: 'How do I reset my password?',
      answer: 'Click on "Login", then select "Forgot Password". Enter your registered email address, and we\'ll send you a password reset link.',
      category: 'account',
      popular: true
    },
    {
      id: 11,
      question: 'Is there a mobile app available?',
      answer: 'Yes, our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store.',
      category: 'account',
      popular: false
    },
    {
      id: 12,
      question: 'How do I leave a review for a venue?',
      answer: 'After your event, you\'ll receive an email inviting you to leave a review. Alternatively, you can go to your booking history and select "Leave a Review".',
      category: 'venues',
      popular: false
    },
    {
      id: 13,
      question: 'What happens if a venue cancels my booking?',
      answer: 'If a venue cancels your booking, you will be notified immediately and offered either a full refund or assistance in finding an alternative venue of similar quality.',
      category: 'booking',
      popular: false
    },
    {
      id: 14,
      question: 'How do I become a venue partner?',
      answer: 'If you own a venue and would like to list it on our platform, please visit our "Partner with Us" page and fill out the registration form. Our team will review your application and contact you.',
      category: 'venues',
      popular: false
    },
    {
      id: 15,
      question: 'Can I book multiple venues for the same event?',
      answer: 'Yes, you can book multiple venues for the same event. Simply complete the booking process for each venue separately, and all bookings will appear in your account dashboard.',
      category: 'booking',
      popular: false
    }
  ];
  
  // Get popular articles when component mounts
  useEffect(() => {
    setPopularArticles(faqs.filter(faq => faq.popular));
  }, []);
  
  // Filter FAQs based on search query and active category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  // Toggle chatbot visibility
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };
  
  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-lg-12 text-center">
          <h1 className="display-5 fw-bold mb-3" style={{ color: "#f05537" }}>How can we help you today?</h1>
          <p className="text-muted mb-4 col-lg-8 mx-auto">Find answers to frequently asked questions, learn about booking venues, or get help with your account.</p>
          <form onSubmit={handleSearchSubmit} className="col-lg-8 mx-auto">
            <div className="input-group input-group-lg">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search for answers..." 
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search help center"
              />
              <button className="btn btn-primary" type="submit" style={{ backgroundColor: "#f05537", borderColor: "#f05537" }}>
                <FaSearch className="me-md-2" /> <span className="d-none d-md-inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Popular Articles */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <h2 className="border-bottom pb-2" style={{ color: "#f05537" }}>Popular Articles</h2>
        </div>
        {popularArticles.map((article, index) => (
          <div className="col-md-6 col-lg-4 mb-4" key={article.id}>
            <div className="card h-100 shadow-sm hover-effect">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-light p-2 me-3">
                    <FaRegThumbsUp style={{ color: "#f05537" }} />
                  </div>
                  <h5 className="card-title mb-0">{article.question}</h5>
                </div>
                <p className="card-text text-muted">{article.answer.substring(0, 100)}...</p>
                <a 
                  href={`#faq${article.id}`} 
                  className="stretched-link text-decoration-none" 
                  style={{ color: "#f05537" }}
                  onClick={() => {
                    setActiveCategory(article.category);
                    setSearchQuery('');
                    document.getElementById(`faq${article.id}`).scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Read more <FaArrowRight className="ms-1" size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Browse by Category */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <h2 className="border-bottom pb-2" style={{ color: "#f05537" }}>Browse by Category</h2>
        </div>
        {categories.map(category => (
          <div className="col-sm-6 col-md-4 mb-4" key={category.id}>
            <div className="card shadow-sm border-0" onClick={() => setActiveCategory(category.id)} style={{ cursor: 'pointer' }}>
              <div className="card-body text-center py-4">
                {React.cloneElement(category.icon, { style: { color: "#f05537", fontSize: '1.1rem', marginBottom: '8px' } })}
                <h6 className="mb-1">{category.name}</h6>
                <small className="text-muted">
                  {category.id === 'all'
                    ? `${faqs.length} articles`
                    : `${faqs.filter(faq => faq.category === category.id).length} articles`}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* FAQ Listing */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0" style={{ color: "#f05537" }}>
              {activeCategory === 'all' ? 'Frequently Asked Questions' : categories.find(c => c.id === activeCategory)?.name}
            </h2>
            {activeCategory !== 'all' && (
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={() => setActiveCategory('all')}
              >
                View All
              </button>
            )}
          </div>
          <hr className="mt-2" />
        </div>
        
        <div className="col-lg-12">
          {filteredFaqs.length > 0 ? (
            <div className="accordion shadow-sm" id="faqAccordion">
              {filteredFaqs.map((faq, index) => (
                <div className="accordion-item" key={faq.id} id={`faq${faq.id}`}>
                  <h3 className="accordion-header">
                    <button 
                      className="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#collapse${faq.id}`}
                    >
                      <span className="me-2 text-muted small">{index + 1}.</span> {faq.question}
                    </button>
                  </h3>
                  <div id={`collapse${faq.id}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      <p>{faq.answer}</p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="badge rounded-pill" style={{ backgroundColor: "#f2f2f2", color: "#666" }}>
                          {categories.find(c => c.id === faq.category)?.name}
                        </span>
                        <div>
                          <button className="btn btn-sm btn-outline-secondary me-2">
                            <FaRegThumbsUp className="me-1" /> Helpful
                          </button>
                          <button 
                            className="btn btn-sm"
                            style={{ color: "#f05537" }}
                            onClick={toggleChatbot}
                          >
                            Still have questions?
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 bg-light rounded">
              <FaSearch className="display-1 text-muted mb-3" />
              <h4>No results found</h4>
              <p className="text-muted">
                We couldn't find any articles matching your search. Try different keywords or browse our categories.
              </p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                style={{ backgroundColor: "#f05537", borderColor: "#f05537" }}
              >
                View All FAQs
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Comparison Table */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <h2 className="border-bottom pb-2" style={{ color: "#f05537" }}>Booking Options Compared</h2>
        </div>
        <div className="col-lg-12">
          <div className="table-responsive shadow-sm">
            <table className="table table-bordered border-light">
              <thead className="table-light">
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col" className="text-center">Standard Booking</th>
                  <th scope="col" className="text-center">Premium Booking</th>
                  <th scope="col" className="text-center">Enterprise Solution</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Instant Confirmation</td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                </tr>
                <tr>
                  <td>Free Cancellation</td>
                  <td className="text-center"><FaTimes className="text-danger" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                </tr>
                <tr>
                  <td>Dedicated Support</td>
                  <td className="text-center"><FaTimes className="text-danger" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                </tr>
                <tr>
                  <td>Custom Venue Setup</td>
                  <td className="text-center"><FaTimes className="text-danger" /></td>
                  <td className="text-center"><FaTimes className="text-danger" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                </tr>
                <tr>
                  <td>Multiple Date Options</td>
                  <td className="text-center"><FaTimes className="text-danger" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                  <td className="text-center"><FaCheck className="text-success" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Additional Resources */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <h2 className="border-bottom pb-2" style={{ color: "#f05537" }}>Additional Resources</h2>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <div className="text-center mb-4">
                <FaBook style={{ color: "#f05537", fontSize: "2rem" }} />
              </div>
              <h4 className="card-title text-center">User Guides</h4>
              <p className="card-text text-center text-muted flex-grow-1">Comprehensive guides for both event organizers and attendees.</p>
              <a 
                href="#" 
                className="btn w-100" 
                style={{ 
                  backgroundColor: "#f05537", 
                  borderColor: "#f05537", 
                  color: "white"
                }}
              >
                Browse Guides
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <div className="text-center mb-4">
                <FaHeadset style={{ color: "#f05537", fontSize: "2rem" }} />
              </div>
              <h4 className="card-title text-center">Contact Support</h4>
              <p className="card-text text-center text-muted flex-grow-1">Can't find what you're looking for? Our support team is here to help.</p>
              <button 
                className="btn w-100" 
                style={{ 
                  backgroundColor: "#f05537", 
                  borderColor: "#f05537", 
                  color: "white" 
                }}
                onClick={toggleChatbot}
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm bg-light">
            <div className="card-body p-5 text-center">
              <h3 className="mb-3">Ready to find your perfect venue?</h3>
              <p className="mb-4">Browse thousands of venues and book your next event with confidence.</p>
              <div className="d-flex justify-content-center gap-3">
                <Link 
                  to="/events" 
                  className="btn btn-lg" 
                  style={{ 
                    backgroundColor: "#f05537", 
                    borderColor: "#f05537", 
                    color: "white",
                    paddingLeft: "2rem",
                    paddingRight: "2rem"
                  }}
                >
                  Browse Venues
                </Link>
                <Link 
                  to="/about" 
                  className="btn btn-outline-secondary btn-lg"
                  style={{
                    paddingLeft: "2rem",
                    paddingRight: "2rem"
                  }}
                >
                  Learn About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      {showChatbot && (
        <div className="position-fixed bottom-0 end-0 mb-4 me-4 shadow-lg" style={{ width: '350px', zIndex: 1050 }}>
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: "#f05537" }}>
              <div className="d-flex align-items-center">
                <FaHeadset className="me-2" />
                <h5 className="mb-0">Support Chat</h5>
              </div>
              <button className="btn-close btn-close-white" onClick={toggleChatbot}></button>
            </div>
            <div className="card-body bg-light" style={{ height: '300px', overflowY: 'auto' }}>
              <div className="chat-message mb-3">
                <div className="bg-white rounded p-3 shadow-sm">
                  <p className="mb-0">Hi there! How can we help you today?</p>
                </div>
                <div className="text-muted small mt-1">Support • Just now</div>
              </div>
            </div>
            <div className="card-footer">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Type your message..." />
                <button className="btn btn-primary" style={{ backgroundColor: "#f05537", borderColor: "#f05537" }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for hover effects */}
      <style jsx>{`
        .hover-effect {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Category card enhancements */
        .card-body {
          padding: 1.5rem;
        }
        
        .card:hover .rounded-circle {
          transform: scale(1.1);
        }
        
        .card-title {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default HelpCenter;