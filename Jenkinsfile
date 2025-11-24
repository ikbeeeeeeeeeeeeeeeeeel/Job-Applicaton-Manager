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
        
        stage('Build Backend') {
            steps {
                echo '🔨 Building Spring Boot Backend...'
                dir('application-management') {
                    sh 'mvn clean compile'
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
        
        stage('Package') {
            steps {
                echo '📦 Packaging Application...'
                dir('application-management') {
                    sh 'mvn package -DskipTests'
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
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
