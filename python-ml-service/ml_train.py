"""
🎓 ML Model Training Script (Phase 3)

Simple script to train the ML model using collected training data.

Usage:
    python ml_train.py [data_file]

If no data file is provided, will try to use training_data.json

Author: Phase 3 Team
Version: 1.0
"""

import sys
import json
from ml_model import MLCVScorer

def main():
    print("\n" + "=" * 60)
    print("🎓 ML MODEL TRAINING")
    print("=" * 60)
    
    # Load training data
    data_file = 'training_data.json'
    if len(sys.argv) > 1:
        data_file = sys.argv[1]
    
    print(f"\n📂 Loading training data from: {data_file}")
    
    try:
        with open(data_file, 'r') as f:
            training_samples = json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {data_file}")
        print("\n💡 Options:")
        print("   1. Run data_collector.py to collect data")
        print("   2. Use synthetic data: python ml_train.py training_data_synthetic.json")
        return
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON file: {data_file}")
        return
    
    print(f"✅ Loaded {len(training_samples)} training samples")
    
    if len(training_samples) < 10:
        print(f"\n⚠️ Warning: Only {len(training_samples)} samples")
        print("   Recommended: At least 50 samples for good accuracy")
        print("   The model may not perform well with so few samples.")
        
        proceed = input("\nProceed anyway? (y/n): ").strip().lower()
        if proceed != 'y':
            print("Training cancelled.")
            return
    
    # Prepare data
    X_data = []
    y_labels = []
    
    for sample in training_samples:
        if 'cv_data' in sample and 'job_data' in sample and 'label' in sample:
            X_data.append({
                'cv_data': sample['cv_data'],
                'job_data': sample['job_data']
            })
            y_labels.append(sample['label'])
    
    print(f"\n📊 Training set:")
    print(f"   Total samples: {len(X_data)}")
    print(f"   Accepted: {sum(y_labels)} ({sum(y_labels)/len(y_labels)*100:.1f}%)")
    print(f"   Rejected: {len(y_labels)-sum(y_labels)} ({(len(y_labels)-sum(y_labels))/len(y_labels)*100:.1f}%)")
    
    # Initialize model
    scorer = MLCVScorer(model_path='models/')
    
    # Train
    metrics = scorer.train(X_data, y_labels)
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 TRAINING COMPLETE!")
    print("=" * 60)
    print(f"📈 Test Accuracy: {metrics['test_accuracy']*100:.2f}%")
    print(f"📊 Samples Used: {metrics['samples']}")
    print(f"🔧 Features: {metrics['features']}")
    print("\n💾 Model saved to: models/cv_scorer_model.pkl")
    print("\n✅ Ready to use for predictions!")
    print("   Start ML service: python ml_app.py")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    main()
