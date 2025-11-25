pipeline {
    agent any
    
    tools {
        maven 'Maven'
        jdk 'JDK-17'
    }
    
    environment {
        SONAR_HOST_URL = 'http://localhost:9000'
        NEXUS_URL = 'http://localhost:8081'
        DOCKER_REGISTRY = 'localhost:5000'  // Optional: for private registry
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Build & Package') {
            steps {
                echo '🔨 Building and Packaging Backend...'
                dir('application-management') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running Unit Tests...'
                dir('application-management') {
                    sh 'mvn test'
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '📊 Running SonarQube Analysis...'
                script {
                    withSonarQubeEnv('SonarQube') {
                        dir('application-management') {
                            sh 'mvn sonar:sonar'
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🚦 Checking Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Upload to Nexus') {
            steps {
                echo '📦 Uploading artifacts to Nexus...'
                dir('application-management') {
                    sh '''
                        mvn deploy -DskipTests \
                        -DaltDeploymentRepository=nexus::default::${NEXUS_URL}/repository/maven-releases/
                    '''
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                echo '💾 Archiving JAR file...'
                archiveArtifacts artifacts: 'application-management/target/*.jar', 
                                 fingerprint: true
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker Images...'
                script {
                    // Build backend image
                    dir('application-management') {
                        sh "docker build -t job-app-backend:${BUILD_NUMBER} ."
                        sh "docker tag job-app-backend:${BUILD_NUMBER} job-app-backend:latest"
                    }
                    
                    // Build frontend image
                    dir('frontend') {
                        sh "docker build -t job-app-frontend:${BUILD_NUMBER} ."
                        sh "docker tag job-app-frontend:${BUILD_NUMBER} job-app-frontend:latest"
                    }
                }
            }
        }
        
        stage('Push to Docker Registry') {
            steps {
                echo '🚀 Pushing Docker Images...'
                script {
                    // Optional: Push to Docker Hub or private registry
                    // Uncomment when ready
                    // sh "docker push job-app-backend:${BUILD_NUMBER}"
                    // sh "docker push job-app-frontend:${BUILD_NUMBER}"
                    echo 'Skipping push - using local images for now'
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying to Kubernetes...'
                script {
                    sh '''
                        kubectl apply -f k8s/mysql-deployment.yaml
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        
                        # Wait for deployments to be ready
                        kubectl rollout status deployment/mysql
                        kubectl rollout status deployment/backend
                        kubectl rollout status deployment/frontend
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '✅ Verifying Kubernetes Deployment...'
                sh '''
                    kubectl get pods
                    kubectl get services
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '🐳 Docker images built and tagged'
            echo '☸️ Application deployed to Kubernetes'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            echo '🧹 Cleaning up...'
            cleanWs()
        }
    }
}
