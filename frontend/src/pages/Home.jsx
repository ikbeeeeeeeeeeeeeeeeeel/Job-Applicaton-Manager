import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: 'var(--spacing-2xl) 0',
        marginBottom: 'var(--spacing-2xl)'
      }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-4xl)', 
          fontWeight: 700,
          marginBottom: 'var(--spacing-md)',
          color: 'var(--gray-900)'
        }}>
          💼 Welcome to JobHub
        </h1>
        <p style={{ 
          fontSize: 'var(--font-size-xl)', 
          color: 'var(--gray-600)',
          maxWidth: '600px',
          margin: '0 auto var(--spacing-xl)'
        }}>
          Your intelligent job application management system powered by AI
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/offer" className="btn btn-primary btn-lg">
            📋 Browse Jobs
          </Link>
          <Link to="/applications" className="btn btn-outline btn-lg">
            📄 My Applications
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-xl)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🤖</div>
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>AI-Powered Matching</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
            Our AI analyzes your profile and matches you with the best job opportunities
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚡</div>
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Quick Applications</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
            Apply to multiple positions with just a few clicks and track your progress
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📊</div>
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Real-Time Tracking</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
            Monitor your application status and interview schedules in one place
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card" style={{ marginTop: 'var(--spacing-2xl)', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
        <div className="grid grid-cols-3" style={{ textAlign: 'center' }}>
          <div style={{ padding: 'var(--spacing-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--white)', marginBottom: 'var(--spacing-xs)' }}>
              100+
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--white)', opacity: 0.9 }}>
              Available Positions
            </div>
          </div>
          <div style={{ padding: 'var(--spacing-lg)', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--white)', marginBottom: 'var(--spacing-xs)' }}>
              500+
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--white)', opacity: 0.9 }}>
              Applications Processed
            </div>
          </div>
          <div style={{ padding: 'var(--spacing-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--white)', marginBottom: 'var(--spacing-xs)' }}>
              95%
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--white)', opacity: 0.9 }}>
              Success Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;