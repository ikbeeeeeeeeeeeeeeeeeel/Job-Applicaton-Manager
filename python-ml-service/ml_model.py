"""
🤖 Machine Learning Model for CV Scoring (Phase 3)

This module trains and uses a RandomForest classifier to predict
if a candidate should be ACCEPTED or REJECTED based on:
- NLP extracted features (skills, experience)
- Job requirements
- Historical HR decisions

Author: Phase 3 Team
Version: 1.0
"""

import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import json
import os
from datetime import datetime

class MLCVScorer:
    """
    Machine Learning model for CV scoring and prediction
    """
    
    def __init__(self, model_path='models/'):
        """
        Initialize the ML model
        
        Args:
            model_path: Directory to save/load models
        """
        self.model_path = model_path
        self.model = None
        self.vectorizer = None
        self.scaler = None
        self.feature_names = []
        
        # Create models directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)
        
        # Try to load existing model
        self.load_model()
    
    def extract_features(self, cv_data, job_data):
        """
        Extract ML features from CV and Job data
        
        Args:
            cv_data: Dict with NLP extracted data (skills, experience, education)
            job_data: Dict with job requirements
            
        Returns:
            Feature vector for ML
        """
        features = {}
        
        # 1. Skills match features
        cv_skills = set([s.lower() for s in cv_data.get('skills', [])])
        job_skills = set([s.lower().strip() for s in job_data.get('required_skills', '').split(',')])
        
        if job_skills:
            skills_intersection = cv_skills.intersection(job_skills)
            features['skills_match_ratio'] = len(skills_intersection) / len(job_skills)
            features['skills_count'] = len(cv_skills)
            features['skills_overlap_count'] = len(skills_intersection)
        else:
            features['skills_match_ratio'] = 0.0
            features['skills_count'] = len(cv_skills)
            features['skills_overlap_count'] = 0
        
        # 2. Experience features
        cv_experience = cv_data.get('experience_years', 0)
        job_experience = job_data.get('required_experience', 0)
        
        features['experience_years'] = cv_experience
        features['experience_match'] = 1.0 if cv_experience >= job_experience else cv_experience / max(job_experience, 1)
        features['experience_excess'] = max(0, cv_experience - job_experience)
        
        # 3. Education features
        education_count = len(cv_data.get('education', []))
        features['education_count'] = education_count
        features['has_education'] = 1.0 if education_count > 0 else 0.0
        
        # 4. Text similarity features (TF-IDF based)
        cv_text = cv_data.get('raw_text', '')
        job_text = job_data.get('description', '')
        
        features['cv_length'] = len(cv_text)
        features['word_count'] = cv_data.get('word_count', 0)
        
        # 5. Job level features
        job_title = job_data.get('title', '').lower()
        features['is_senior'] = 1.0 if 'senior' in job_title or 'lead' in job_title else 0.0
        features['is_junior'] = 1.0 if 'junior' in job_title or 'entry' in job_title else 0.0
        
        return features
    
    def train(self, training_data, labels):
        """
        Train the ML model on historical data
        
        Args:
            training_data: List of dicts with CV + Job features
            labels: List of outcomes (1 = ACCEPTED, 0 = REJECTED)
            
        Returns:
            Training metrics (accuracy, etc.)
        """
        print("\n" + "=" * 60)
        print("🎓 TRAINING MACHINE LEARNING MODEL (Phase 3)")
        print("=" * 60)
        
        # Extract features from training data
        X = []
        for data in training_data:
            features = self.extract_features(data['cv_data'], data['job_data'])
            X.append(list(features.values()))
            if not self.feature_names:
                self.feature_names = list(features.keys())
        
        X = np.array(X)
        y = np.array(labels)
        
        print(f"\n📊 Training Data:")
        print(f"   Samples: {len(X)}")
        print(f"   Features: {len(self.feature_names)}")
        print(f"   Accepted: {sum(y)} ({sum(y)/len(y)*100:.1f}%)")
        print(f"   Rejected: {len(y)-sum(y)} ({(len(y)-sum(y))/len(y)*100:.1f}%)")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train RandomForest
        print("\n🌲 Training RandomForest Classifier...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced'
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred_train = self.model.predict(X_train_scaled)
        y_pred_test = self.model.predict(X_test_scaled)
        
        train_accuracy = accuracy_score(y_train, y_pred_train)
        test_accuracy = accuracy_score(y_test, y_pred_test)
        
        print(f"\n📈 Training Results:")
        print(f"   Training Accuracy: {train_accuracy*100:.2f}%")
        print(f"   Testing Accuracy: {test_accuracy*100:.2f}%")
        
        print(f"\n📊 Classification Report:")
        print(classification_report(y_test, y_pred_test, 
                                   target_names=['REJECTED', 'ACCEPTED']))
        
        print(f"\n🔍 Confusion Matrix:")
        cm = confusion_matrix(y_test, y_pred_test)
        print(f"   TN: {cm[0][0]}, FP: {cm[0][1]}")
        print(f"   FN: {cm[1][0]}, TP: {cm[1][1]}")
        
        # Feature importance
        importances = self.model.feature_importances_
        feature_importance = sorted(zip(self.feature_names, importances), 
                                   key=lambda x: x[1], reverse=True)
        
        print(f"\n🎯 Top 5 Most Important Features:")
        for feat, imp in feature_importance[:5]:
            print(f"   {feat}: {imp:.3f}")
        
        # Save model
        self.save_model()
        
        print("\n✅ Model training complete!")
        print("=" * 60)
        
        return {
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'samples': len(X),
            'features': len(self.feature_names),
            'feature_importance': dict(feature_importance)
        }
    
    def predict(self, cv_data, job_data):
        """
        Predict if candidate should be accepted
        
        Args:
            cv_data: Dict with NLP extracted CV data
            job_data: Dict with job requirements
            
        Returns:
            Dict with prediction, probability, and confidence
        """
        if self.model is None:
            return {
                'prediction': 'UNKNOWN',
                'probability': 0.5,
                'confidence': 'low',
                'ml_score': 50.0,
                'error': 'Model not trained'
            }
        
        # Extract features
        features = self.extract_features(cv_data, job_data)
        X = np.array([list(features.values())])
        
        # Scale
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        
        # Calculate confidence
        max_prob = max(probabilities)
        if max_prob > 0.8:
            confidence = 'high'
        elif max_prob > 0.6:
            confidence = 'medium'
        else:
            confidence = 'low'
        
        result = {
            'prediction': 'ACCEPTED' if prediction == 1 else 'REJECTED',
            'probability': float(probabilities[1]),  # Probability of ACCEPTED
            'confidence': confidence,
            'ml_score': float(probabilities[1] * 100),  # 0-100 score
            'features_used': features
        }
        
        return result
    
    def save_model(self):
        """Save trained model to disk"""
        if self.model is None:
            print("⚠️ No model to save")
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        model_file = os.path.join(self.model_path, 'cv_scorer_model.pkl')
        scaler_file = os.path.join(self.model_path, 'scaler.pkl')
        meta_file = os.path.join(self.model_path, 'model_metadata.json')
        
        with open(model_file, 'wb') as f:
            pickle.dump(self.model, f)
        
        with open(scaler_file, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        metadata = {
            'feature_names': self.feature_names,
            'trained_at': timestamp,
            'model_type': 'RandomForestClassifier'
        }
        
        with open(meta_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Model saved to {model_file}")
    
    def load_model(self):
        """Load trained model from disk"""
        model_file = os.path.join(self.model_path, 'cv_scorer_model.pkl')
        scaler_file = os.path.join(self.model_path, 'scaler.pkl')
        meta_file = os.path.join(self.model_path, 'model_metadata.json')
        
        if not os.path.exists(model_file):
            print("ℹ️ No pre-trained model found. Train a new model first.")
            return False
        
        try:
            with open(model_file, 'rb') as f:
                self.model = pickle.load(f)
            
            with open(scaler_file, 'rb') as f:
                self.scaler = pickle.load(f)
            
            with open(meta_file, 'r') as f:
                metadata = json.load(f)
                self.feature_names = metadata['feature_names']
            
            print(f"✅ Model loaded from {model_file}")
            print(f"   Trained at: {metadata.get('trained_at', 'unknown')}")
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    
    def get_model_info(self):
        """Get information about the current model"""
        if self.model is None:
            return {
                'status': 'not_trained',
                'message': 'No model available. Train first.'
            }
        
        meta_file = os.path.join(self.model_path, 'model_metadata.json')
        
        if os.path.exists(meta_file):
            with open(meta_file, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {}
        
        return {
            'status': 'ready',
            'model_type': 'RandomForestClassifier',
            'n_features': len(self.feature_names),
            'feature_names': self.feature_names,
            'trained_at': metadata.get('trained_at', 'unknown'),
            'n_estimators': self.model.n_estimators if hasattr(self.model, 'n_estimators') else None
        }


if __name__ == '__main__':
    # Test with synthetic data
    print("🧪 Testing ML Model with synthetic data...")
    
    scorer = MLCVScorer()
    
    # Create synthetic training data
    training_data = []
    labels = []
    
    # Good candidates (ACCEPTED)
    for i in range(50):
        training_data.append({
            'cv_data': {
                'skills': ['java', 'spring', 'mysql', 'docker'],
                'experience_years': 5 + i % 3,
                'education': ['Bachelor CS'],
                'raw_text': 'Experienced developer with strong skills',
                'word_count': 500
            },
            'job_data': {
                'title': 'Senior Java Developer',
                'required_skills': 'java, spring, mysql',
                'required_experience': 5,
                'description': 'Looking for experienced Java developer'
            }
        })
        labels.append(1)  # ACCEPTED
    
    # Weak candidates (REJECTED)
    for i in range(50):
        training_data.append({
            'cv_data': {
                'skills': ['python'],
                'experience_years': 1,
                'education': [],
                'raw_text': 'Junior developer',
                'word_count': 200
            },
            'job_data': {
                'title': 'Senior Java Developer',
                'required_skills': 'java, spring, mysql',
                'required_experience': 5,
                'description': 'Looking for experienced Java developer'
            }
        })
        labels.append(0)  # REJECTED
    
    # Train
    metrics = scorer.train(training_data, labels)
    
    # Test prediction
    test_cv = {
        'skills': ['java', 'spring', 'react'],
        'experience_years': 6,
        'education': ['Master CS'],
        'raw_text': 'Senior developer with 6 years experience',
        'word_count': 450
    }
    
    test_job = {
        'title': 'Senior Java Developer',
        'required_skills': 'java, spring, mysql',
        'required_experience': 5,
        'description': 'Looking for experienced Java developer'
    }
    
    prediction = scorer.predict(test_cv, test_job)
    print(f"\n🔮 Test Prediction:")
    print(f"   Result: {prediction['prediction']}")
    print(f"   ML Score: {prediction['ml_score']:.1f}%")
    print(f"   Confidence: {prediction['confidence']}")
