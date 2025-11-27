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
                echo '🔨 Building Backend with Maven...'
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
        
        stage('Deploy Application') {
            steps {
                echo '🚀 Deploying Application...'
                sh '''
                    docker-compose -f docker-compose.yml down || true
                    docker-compose -f docker-compose.yml up -d
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '✅ Verifying Deployment...'
                sh '''
                    sleep 10
                    docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                '''
                echo '🎉 Deployment Complete!'
                echo '📱 Frontend: http://localhost:80'
                echo '🔧 Backend: http://localhost:8089'
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '🐳 Docker images: job-app-backend:latest, job-app-frontend:latest'
            echo '🚀 Application is running!'
            echo '📱 Access your app at: http://localhost:80'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
        always {
            echo '🧹 Pipeline execution finished'
        }
    }
}