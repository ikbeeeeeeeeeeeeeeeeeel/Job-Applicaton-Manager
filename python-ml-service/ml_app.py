"""
🤖 Machine Learning API Service (Phase 3)

Flask API that exposes ML model for training and prediction.
Works in conjunction with Phase 2 NLP service.

Endpoints:
- POST /api/train - Train model with historical data
- POST /api/predict - Predict candidate acceptance
- GET /api/model-info - Get model information
- GET / - Health check

Author: Phase 3 Team
Version: 1.0
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_model import MLCVScorer
import sys

app = Flask(__name__)
CORS(app)

# Initialize ML model
ml_scorer = MLCVScorer(model_path='models/')

print("\n" + "=" * 60)
print("🤖 Starting ML Prediction Service (Phase 3)")
print("=" * 60)
print(f"📍 Endpoint: http://localhost:5001")
print(f"📌 APIs:")
print(f"   POST /api/train - Train model")
print(f"   POST /api/predict - Predict candidate")
print(f"   GET  /api/model-info - Model information")
print("=" * 60)

# Check model status
model_info = ml_scorer.get_model_info()
if model_info['status'] == 'ready':
    print(f"✅ Pre-trained model loaded!")
    print(f"   Features: {model_info['n_features']}")
    print(f"   Trained: {model_info['trained_at']}")
else:
    print(f"ℹ️ No model loaded. Train using /api/train endpoint")

print("=" * 60 + "\n")


@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_info = ml_scorer.get_model_info()
    
    return jsonify({
        'status': 'online',
        'service': 'ML Prediction Service',
        'version': '3.0',
        'phase': '3',
        'model_status': model_info['status'],
        'model_ready': model_info['status'] == 'ready'
    })


@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Get detailed model information"""
    try:
        info = ml_scorer.get_model_info()
        return jsonify({
            'success': True,
            'model_info': info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/train', methods=['POST'])
def train_model():
    """
    Train the ML model with historical data
    
    Expected JSON:
    {
        "training_data": [
            {
                "cv_data": {...},  # From NLP service
                "job_data": {...},
                "label": 1  # 1 = ACCEPTED, 0 = REJECTED
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'training_data' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing training_data in request'
            }), 400
        
        training_samples = data['training_data']
        
        if len(training_samples) < 10:
            return jsonify({
                'success': False,
                'error': 'Need at least 10 training samples'
            }), 400
        
        print("\n" + "=" * 60)
        print(f"📦 Received {len(training_samples)} training samples")
        print("=" * 60)
        
        # Prepare data
        X_data = []
        y_labels = []
        
        for sample in training_samples:
            if 'cv_data' not in sample or 'job_data' not in sample or 'label' not in sample:
                continue
            
            X_data.append({
                'cv_data': sample['cv_data'],
                'job_data': sample['job_data']
            })
            y_labels.append(sample['label'])
        
        # Train model
        metrics = ml_scorer.train(X_data, y_labels)
        
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'metrics': metrics
        })
    
    except Exception as e:
        print(f"❌ Training error: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/predict', methods=['POST'])
def predict_candidate():
    """
    Predict if candidate should be accepted
    
    Expected JSON:
    {
        "cv_data": {
            "skills": [...],
            "experience_years": 5,
            "education": [...],
            "raw_text": "...",
            "word_count": 500
        },
        "job_data": {
            "title": "Senior Java Developer",
            "required_skills": "java, spring, mysql",
            "required_experience": 5,
            "description": "..."
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        if 'cv_data' not in data or 'job_data' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing cv_data or job_data'
            }), 400
        
        print("\n" + "=" * 60)
        print("🔮 ML PREDICTION REQUEST")
        print("=" * 60)
        print(f"📄 Job: {data['job_data'].get('title', 'Unknown')}")
        print(f"🔧 CV Skills: {len(data['cv_data'].get('skills', []))}")
        print(f"📅 Experience: {data['cv_data'].get('experience_years', 0)} years")
        
        # Make prediction
        prediction = ml_scorer.predict(data['cv_data'], data['job_data'])
        
        print(f"\n🎯 Prediction: {prediction['prediction']}")
        print(f"📊 ML Score: {prediction['ml_score']:.1f}%")
        print(f"🎚️ Confidence: {prediction['confidence']}")
        print("=" * 60 + "\n")
        
        return jsonify({
            'success': True,
            **prediction
        })
    
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e),
            'prediction': 'UNKNOWN',
            'ml_score': 50.0,
            'confidence': 'low'
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
