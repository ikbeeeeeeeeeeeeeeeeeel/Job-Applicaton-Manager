import { useState, useEffect } from 'react'

/**
 * ML Model Management Component
 * 
 * Admin interface to manage ML model:
 * - View model status and information
 * - Train/Retrain the model
 * - Check ML service health
 * - View training history
 */
export default function MLModelManagement() {
  const [modelInfo, setModelInfo] = useState(null)
  const [serviceStatus, setServiceStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [trainingResult, setTrainingResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchModelInfo()
    fetchServiceStatus()
  }, [])

  const fetchModelInfo = async () => {
    try {
      const response = await fetch('http://localhost:8089/api/admin/ml/info')
      if (response.ok) {
        const data = await response.json()
        setModelInfo(data)
      }
    } catch (err) {
      console.error('Error fetching model info:', err)
      setError('Failed to fetch model information')
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:8089/api/admin/ml/status')
      if (response.ok) {
        const data = await response.json()
        setServiceStatus(data)
      }
    } catch (err) {
      console.error('Error fetching service status:', err)
    }
  }

  const handleTrainModel = async () => {
    setTraining(true)
    setError('')
    setTrainingResult(null)

    try {
      const response = await fetch('http://localhost:8089/api/admin/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          training_size: 100,
          test_size: 0.2
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTrainingResult(data)
        // Refresh model info after training
        await fetchModelInfo()
        await fetchServiceStatus()
      } else {
        setError(data.error || 'Training failed')
      }
    } catch (err) {
      console.error('Error training model:', err)
      setError('Failed to train model. Make sure ML service is running.')
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-2xl)' }}>
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>🤖 ML Model Management</h1>
        <p style={{ color: 'var(--gray-600)' }}>
          Manage and monitor the Machine Learning model used for candidate evaluation
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: 'var(--spacing-md)', 
          background: 'var(--danger-light)', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--danger)',
          borderLeft: '3px solid var(--danger)'
        }}>
          ⚠️ {error}
        </div>
      )}

      {trainingResult && (
        <div style={{ 
          padding: 'var(--spacing-md)', 
          background: 'var(--secondary-light)', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--secondary)',
          borderLeft: '3px solid var(--secondary)'
        }}>
          <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-lg)' }}>
            ✅ Model Trained Successfully!
          </h3>
          <p style={{ margin: '4px 0', fontSize: 'var(--font-size-sm)' }}>
            <strong>Accuracy:</strong> {(trainingResult.accuracy * 100).toFixed(2)}%
          </p>
          <p style={{ margin: '4px 0', fontSize: 'var(--font-size-sm)' }}>
            <strong>F1 Score:</strong> {trainingResult.f1_score?.toFixed(4) || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', fontSize: 'var(--font-size-sm)' }}>
            <strong>Training Samples:</strong> {trainingResult.training_samples}
          </p>
          <p style={{ margin: '4px 0', fontSize: 'var(--font-size-sm)' }}>
            <strong>Test Samples:</strong> {trainingResult.test_samples}
          </p>
        </div>
      )}

      {/* Service Status Card */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-xl)' }}>
          📡 Service Status
        </h2>
        
        {loading ? (
          <p>Loading status...</p>
        ) : serviceStatus ? (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              background: serviceStatus.ml_service_available ? 'var(--secondary-light)' : 'var(--danger-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)'
            }}>
              <span style={{ fontSize: '2rem' }}>
                {serviceStatus.ml_service_available ? '✅' : '❌'}
              </span>
              <div>
                <p style={{ 
                  margin: 0, 
                  fontWeight: 600,
                  color: serviceStatus.ml_service_available ? 'var(--secondary)' : 'var(--danger)'
                }}>
                  ML Service: {serviceStatus.status?.toUpperCase()}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  {serviceStatus.message}
                </p>
              </div>
            </div>

            {!serviceStatus.ml_service_available && (
              <div style={{ 
                padding: 'var(--spacing-md)', 
                background: 'var(--gray-100)', 
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>To start ML service:</p>
                <code style={{ 
                  display: 'block', 
                  padding: 'var(--spacing-sm)', 
                  background: 'var(--gray-800)', 
                  color: 'var(--white)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  cd python-ml-service && python ml_app.py
                </code>
              </div>
            )}
          </div>
        ) : (
          <p>Unable to fetch service status</p>
        )}
      </div>

      {/* Model Information Card */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-xl)' }}>
          📊 Model Information
        </h2>
        
        {loading ? (
          <p>Loading model information...</p>
        ) : modelInfo ? (
          <div>
            {modelInfo.model_loaded ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-md)'
              }}>
                <InfoBox 
                  label="Status" 
                  value="✅ Loaded"
                  color="var(--secondary)"
                />
                <InfoBox 
                  label="Accuracy" 
                  value={modelInfo.accuracy ? `${(modelInfo.accuracy * 100).toFixed(2)}%` : 'N/A'}
                  color="var(--primary)"
                />
                <InfoBox 
                  label="Training Samples" 
                  value={modelInfo.training_samples || 'N/A'}
                  color="var(--info)"
                />
                <InfoBox 
                  label="Test Samples" 
                  value={modelInfo.test_samples || 'N/A'}
                  color="var(--warning)"
                />
              </div>
            ) : (
              <div style={{ 
                padding: 'var(--spacing-lg)', 
                background: 'var(--gray-100)', 
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--spacing-md)' }}>
                  ⚠️
                </span>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--gray-700)' }}>
                  No model loaded
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                  Train a new model to start using ML predictions
                </p>
              </div>
            )}
          </div>
        ) : (
          <p>Unable to fetch model information</p>
        )}
      </div>

      {/* Training Actions Card */}
      <div className="card">
        <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-xl)' }}>
          🎓 Training Actions
        </h2>
        
        <div style={{ 
          padding: 'var(--spacing-md)', 
          background: 'var(--gray-50)', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-base)' }}>
            Train with Synthetic Data
          </h3>
          <p style={{ margin: '0 0 var(--spacing-md) 0', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
            Generate 100 synthetic examples and train the RandomForest model. 
            This will take approximately 5-10 seconds.
          </p>
          
          <button
            onClick={handleTrainModel}
            disabled={training || (serviceStatus && !serviceStatus.ml_service_available)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {training ? '🔄 Training Model...' : '🎓 Train Model'}
          </button>
        </div>

        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
          <p style={{ margin: '8px 0' }}>
            <strong>Training Configuration:</strong>
          </p>
          <ul style={{ margin: '8px 0', paddingLeft: 'var(--spacing-lg)' }}>
            <li>Training samples: 100 synthetic examples</li>
            <li>Test split: 20% (80/20 split)</li>
            <li>Algorithm: RandomForest (100 trees)</li>
            <li>Features: 11 engineered features</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Helper component for info boxes
function InfoBox({ label, value, color }) {
  return (
    <div style={{ 
      padding: 'var(--spacing-md)', 
      background: 'var(--gray-50)', 
      borderRadius: 'var(--radius-md)',
      border: `2px solid ${color}20`
    }}>
      <p style={{ 
        margin: '0 0 4px 0', 
        fontSize: 'var(--font-size-xs)', 
        color: 'var(--gray-600)',
        textTransform: 'uppercase',
        fontWeight: 600
      }}>
        {label}
      </p>
      <p style={{ 
        margin: 0, 
        fontSize: 'var(--font-size-xl)', 
        fontWeight: 700,
        color: color
      }}>
        {value}
      </p>
    </div>
  )
}
