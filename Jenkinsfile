pipeline {
    agent any
    
    tools {
        maven 'Maven'
        jdk 'JDK-17'
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
        
        stage('List Docker Images') {
            steps {
                echo '📋 Docker Images Created:'
                sh 'docker images | grep job-app'
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '🐳 Docker images built and tagged'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
