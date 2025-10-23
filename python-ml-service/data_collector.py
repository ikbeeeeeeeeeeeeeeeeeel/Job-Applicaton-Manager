"""
📊 Historical Data Collector for ML Training (Phase 3)

This script collects historical application data from the database
and prepares it for ML model training.

It fetches:
- Applications with HR decisions (ACCEPTED/REJECTED)
- CV data (from NLP extraction)
- Job offer data
- Formats data for ML training

Author: Phase 3 Team
Version: 1.0
"""

import requests
import json
import sys
from datetime import datetime

class DataCollector:
    """
    Collects and prepares historical data for ML training
    """
    
    def __init__(self, spring_boot_url='http://localhost:8089'):
        """
        Initialize data collector
        
        Args:
            spring_boot_url: URL of Spring Boot backend
        """
        self.spring_boot_url = spring_boot_url
        self.nlp_service_url = 'http://localhost:5000'
    
    def fetch_applications(self):
        """
        Fetch all applications with decisions from Spring Boot
        
        Returns:
            List of applications with decisions
        """
        try:
            print("📡 Fetching applications from Spring Boot...")
            
            # This endpoint needs to be created in Spring Boot
            response = requests.get(f"{self.spring_boot_url}/api/applications/training-data")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Fetched {len(data)} applications")
                return data
            else:
                print(f"❌ Error fetching data: {response.status_code}")
                return []
        
        except requests.exceptions.ConnectionRefused:
            print(f"❌ Cannot connect to Spring Boot at {self.spring_boot_url}")
            print("   Make sure Spring Boot is running!")
            return []
        
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def extract_cv_with_nlp(self, resume_base64, file_type='pdf'):
        """
        Extract CV data using NLP service
        
        Args:
            resume_base64: Base64 encoded CV
            file_type: 'pdf' or 'docx'
            
        Returns:
            Extracted CV data
        """
        try:
            response = requests.post(
                f"{self.nlp_service_url}/api/extract-cv-data",
                json={
                    'resume': resume_base64,
                    'fileType': file_type
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return data
            
            return None
        
        except Exception as e:
            print(f"⚠️ NLP extraction failed: {e}")
            return None
    
    def prepare_training_data(self, applications):
        """
        Prepare data for ML training
        
        Args:
            applications: List of application records
            
        Returns:
            List of training samples
        """
        training_data = []
        
        print("\n📦 Preparing training data...")
        print("=" * 60)
        
        for i, app in enumerate(applications, 1):
            print(f"\nProcessing {i}/{len(applications)}: Application ID {app.get('id', 'N/A')}")
            
            # Must have a decision
            status = app.get('status', '').upper()
            if status not in ['ACCEPTED', 'REJECTED']:
                print(f"   ⚠️ Skipped - No decision (status: {status})")
                continue
            
            # Must have resume
            resume = app.get('resume')
            if not resume or len(resume) < 100:
                print(f"   ⚠️ Skipped - No resume")
                continue
            
            # Extract CV data with NLP
            print(f"   🔍 Extracting CV with NLP...")
            cv_data = self.extract_cv_with_nlp(resume, 'pdf')
            
            if not cv_data:
                print(f"   ⚠️ Skipped - NLP extraction failed")
                continue
            
            # Prepare job data
            job_offer = app.get('jobOffer', {})
            job_data = {
                'title': job_offer.get('title', ''),
                'required_skills': job_offer.get('requiredSkills', ''),
                'required_experience': job_offer.get('experienceLevel', 0),
                'description': job_offer.get('description', '')
            }
            
            # Prepare label
            label = 1 if status == 'ACCEPTED' else 0
            
            training_sample = {
                'cv_data': {
                    'skills': cv_data.get('skills', []),
                    'experience_years': cv_data.get('experience_years', 0),
                    'education': cv_data.get('education', []),
                    'raw_text': cv_data.get('raw_text', ''),
                    'word_count': cv_data.get('word_count', 0)
                },
                'job_data': job_data,
                'label': label
            }
            
            training_data.append(training_sample)
            
            print(f"   ✅ Added - Decision: {status}, Skills: {len(cv_data.get('skills', []))}")
        
        print("\n" + "=" * 60)
        print(f"✅ Prepared {len(training_data)} training samples")
        print(f"   Accepted: {sum(1 for d in training_data if d['label'] == 1)}")
        print(f"   Rejected: {sum(1 for d in training_data if d['label'] == 0)}")
        
        return training_data
    
    def collect_and_prepare(self):
        """
        Main method to collect and prepare all training data
        
        Returns:
            Training data ready for ML
        """
        print("\n" + "=" * 60)
        print("📊 HISTORICAL DATA COLLECTION")
        print("=" * 60)
        
        # 1. Fetch applications
        applications = self.fetch_applications()
        
        if not applications:
            print("\n⚠️ No applications found!")
            print("   You need historical data with HR decisions to train the model.")
            return []
        
        # 2. Prepare training data
        training_data = self.prepare_training_data(applications)
        
        if len(training_data) < 10:
            print("\n⚠️ Not enough training data!")
            print(f"   Found: {len(training_data)} samples")
            print(f"   Needed: At least 10 samples")
            return []
        
        # 3. Save to file
        output_file = 'training_data.json'
        with open(output_file, 'w') as f:
            json.dump(training_data, f, indent=2)
        
        print(f"\n💾 Saved training data to: {output_file}")
        print("=" * 60 + "\n")
        
        return training_data
    
    def generate_synthetic_data(self, n_samples=100):
        """
        Generate synthetic training data for testing
        (Use this if you don't have real historical data yet)
        
        Args:
            n_samples: Number of samples to generate
            
        Returns:
            Synthetic training data
        """
        print("\n🧪 Generating synthetic training data...")
        print(f"   Samples: {n_samples}")
        
        training_data = []
        
        # Good candidates (will be accepted)
        for i in range(n_samples // 2):
            experience = 3 + (i % 5)
            skills_count = 3 + (i % 3)
            
            skills = []
            all_skills = ['java', 'spring', 'mysql', 'docker', 'react', 'angular', 'python']
            for j in range(skills_count):
                skills.append(all_skills[j % len(all_skills)])
            
            training_data.append({
                'cv_data': {
                    'skills': skills,
                    'experience_years': experience,
                    'education': ['Bachelor CS', 'Master CS'][:1 + (i % 2)],
                    'raw_text': f'Experienced developer with {experience} years',
                    'word_count': 400 + (i % 200)
                },
                'job_data': {
                    'title': 'Senior Developer' if experience >= 5 else 'Developer',
                    'required_skills': ', '.join(skills[:2]),
                    'required_experience': min(experience, 5),
                    'description': 'Looking for experienced developer'
                },
                'label': 1  # ACCEPTED
            })
        
        # Weak candidates (will be rejected)
        for i in range(n_samples // 2):
            training_data.append({
                'cv_data': {
                    'skills': ['python'] if i % 2 == 0 else [],
                    'experience_years': 1,
                    'education': [],
                    'raw_text': 'Junior developer',
                    'word_count': 150 + (i % 50)
                },
                'job_data': {
                    'title': 'Senior Java Developer',
                    'required_skills': 'java, spring, mysql',
                    'required_experience': 5,
                    'description': 'Looking for experienced Java developer'
                },
                'label': 0  # REJECTED
            })
        
        print(f"✅ Generated {len(training_data)} synthetic samples")
        print(f"   Accepted: {sum(1 for d in training_data if d['label'] == 1)}")
        print(f"   Rejected: {sum(1 for d in training_data if d['label'] == 0)}")
        
        # Save
        with open('training_data_synthetic.json', 'w') as f:
            json.dump(training_data, f, indent=2)
        
        print(f"💾 Saved to: training_data_synthetic.json\n")
        
        return training_data


if __name__ == '__main__':
    collector = DataCollector()
    
    print("📊 Data Collection Options:")
    print("1. Collect real data from database")
    print("2. Generate synthetic data for testing")
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == '1':
        training_data = collector.collect_and_prepare()
    elif choice == '2':
        training_data = collector.generate_synthetic_data(n_samples=100)
    else:
        print("Invalid choice!")
        sys.exit(1)
    
    if training_data:
        print("\n✅ Training data is ready!")
        print("   Next step: Train the ML model")
        print("   Run: python ml_train.py")
