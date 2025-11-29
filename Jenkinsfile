pipeline {
    agent any
    
    tools {
        maven 'Maven-3.9.6'
        jdk 'JDK-21'
    }
    
    environment {
        // Application
        BACKEND_DIR = 'application-management'
        FRONTEND_DIR = 'frontend'
        
        // Docker
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
        BACKEND_IMAGE = 'job-manager-backend'
        FRONTEND_IMAGE = 'job-manager-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('📋 Checkout') {
            steps {
                echo '📋 Checking out code from GitHub...'
                checkout scm
                sh 'git log -1 --pretty=format:"%h - %an: %s"'
            }
        }
        
        stage('🧹 Clean') {
            steps {
                echo '🧹 Cleaning previous builds...'
                dir("${BACKEND_DIR}") {
                    sh 'mvn clean'
                }
            }
        }
        
        stage('🔨 Build Backend') {
            steps {
                echo '🔨 Building Spring Boot Backend...'
                dir("${BACKEND_DIR}") {
                    sh 'mvn compile'
                }
            }
        }
       
        stage('🧪 Unit Tests') {
            steps {
                echo '🧪 Running JUnit & Mockito tests...'
                dir("${BACKEND_DIR}") {
                    sh 'mvn test'
                }
            }
            post {
                always {
                    junit "${BACKEND_DIR}/target/surefire-reports/*.xml"
                }
            }
        }
        
        stage('� SonarQube Analysis') {
            steps {
                echo '📊 Running SonarQube code analysis...'
                dir("${BACKEND_DIR}") {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            mvn sonar:sonar \
                              -Dsonar.projectKey=job-application-manager \
                              -Dsonar.projectName="Job Application Manager" \
                              -Dsonar.java.binaries=target/classes
                        '''
                    }
                }
            }
        }
        
        stage('�📦 Package Backend') {
            steps {
                echo '📦 Creating JAR...'
                dir("${BACKEND_DIR}") {
                    sh 'mvn package -DskipTests'
                }
            }
        }
        
        stage('🐳 Build Docker Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        echo '🐳 Building Backend Docker image...'
                        dir("${BACKEND_DIR}") {
                            script {
                                dockerImageBackend = docker.build("${BACKEND_IMAGE}:${IMAGE_TAG}")
                                dockerImageBackend.tag('latest')
                            }
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        echo '🐳 Building Frontend Docker image...'
                        dir("${FRONTEND_DIR}") {
                            script {
                                dockerImageFrontend = docker.build("${FRONTEND_IMAGE}:${IMAGE_TAG}")
                                dockerImageFrontend.tag('latest')
                            }
                        }
                    }
                }
            }
        }
        
        stage('🚀 Deploy with Docker Compose') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying with Docker Compose...'
                sh '''
                    docker-compose down || true
                    docker-compose up -d
                '''
            }
        }
        
        stage('✅ Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo '✅ Checking application health...'
                script {
                    sleep 30
                    sh '''
                        curl -f http://localhost:8089/actuator/health || exit 1
                        echo "Backend is healthy ✅"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Please check the logs.'
        }
    }
}