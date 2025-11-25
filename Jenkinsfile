pipeline {
    agent any
    
    tools {
        maven 'Maven'
        jdk 'JDK-17'
    }
    
    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        NEXUS_URL = 'http://nexus:8081'
        NEXUS_REPOSITORY = 'maven-releases'
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
        
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube Analysis...'
                script {
                    dir('application-management') {
                        withSonarQubeEnv('SonarQube') {
                            sh 'mvn sonar:sonar -Dsonar.projectKey=job-application-manager'
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🚦 Checking Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }
        
        stage('Upload to Nexus') {
            steps {
                echo '📦 Uploading artifacts to Nexus...'
                script {
                    dir('application-management') {
                        withCredentials([usernamePassword(credentialsId: 'nexus-credentials', 
                                                         usernameVariable: 'NEXUS_USER', 
                                                         passwordVariable: 'NEXUS_PASS')]) {
                            sh """
                                mvn deploy -DskipTests \
                                -DaltDeploymentRepository=nexus::default::${NEXUS_URL}/repository/${NEXUS_REPOSITORY}
                            """
                        }
                    }
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
                    dir('application-management') {
                        sh "docker build -t job-app-backend:${BUILD_NUMBER} ."
                        sh "docker tag job-app-backend:${BUILD_NUMBER} job-app-backend:latest"
                    }
                    
                    dir('frontend') {
                        sh "docker build -t job-app-frontend:${BUILD_NUMBER} ."
                        sh "docker tag job-app-frontend:${BUILD_NUMBER} job-app-frontend:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying to Kubernetes...'
                script {
                    sh """
                        kubectl apply -f k8s/mysql-deployment.yaml
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                    """
                    
                    echo '⏳ Waiting for rollout...'
                    sh """
                        kubectl rollout status deployment/mysql -n default --timeout=5m
                        kubectl rollout status deployment/job-app-backend -n default --timeout=5m
                        kubectl rollout status deployment/job-app-frontend -n default --timeout=5m
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '✅ Verifying Kubernetes Deployment...'
                sh """
                    kubectl get pods -n default
                    kubectl get services -n default
                """
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
            echo '🧹 Cleaning up workspace...'
        }
    }
}