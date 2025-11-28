-3.8.72'
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
        
        // SonarQube
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_TOKEN = credentials('sonarqube-token')
        
        // Nexus
        NEXUS_URL = 'http://localhost:8081'
        NEXUS_CREDENTIALS = 'nexus-credentials'
        NEXUS_REPO = 'maven-releases📋 � from GitHubt scm
                sh 'git log -1 --pretty=format:"%h - %an: %s"'
            }
        }
        
        sage('🧹Clean') {
            teps {
                eho '🧹 Cleaning previous builds...'
                dir("${BACKEND_DIR}") {
                    sh 'vn clean'
                }🔨 Bnding Spr BootBcked...'
                ir("${BACKEND_DIR}") {
                    sh 'mvn compile'
                }
            }
        }
       
        stge('🧪 Unit Tests - Baend') {
            steps {
                echo '🧪 Running JUnit & Mockito tests...'
                dir("${BACKEND_DIR}") {
                    sh 'mvn test'
                }
            }
            post {
                always {
                    junit "${BACKEND_DIR}/tret/surefre-reports/*.xml"
                    jacoco execPatter:"${ACKEND_DIR}/trget/jaoco.xec"
                }
            }
        }
        
        stage('📊 SoarQube Analysis') {
            steps {
                echo '📊 Running SonarQube coe analysisir("${BACKEND_DIR}") {
                    wthSonaQubeEnv'SonarQube) {
                        sh """
                            mvn sonar:sonar \
                            -Dsonr.rojectKey=job-apr \
                            -Dsonar.projectNa='Job Application Manager' \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN} \
                            -Dsoar.java.binaries=target/classes
                        """
                    }
                }
            }
        }
        
        sage(✅ Quality Gate'steps{
         eco✅ Checking SonarQube Quality Gate...'
                tieout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('📦 Package Backed') {
            steps {
               eho '📦 Crtig JAR...'
                dir("${BACKEND_DIR}") {
                   sh 'mvn package 📤 Publish to Nexus') {
            when {
                ban 'man'
            }
            stps{
                echo '📤 Publishing a to Nexu...
                dir("${BACKEND_DIR}"
                    sh """
                        mvn deploy -DskipTests \            -DaltDeploymentRepository=nexu::defaul::${NEXUS_URL}/roitory/${NEXUS_REPO}
                   """
                }
            }
        }
        
        stage('🐳 Build Docker Images') {
            parallel stag('Bakend Image') {
                    steps {
                        ec�Building Backend Docker image...'
                        dir("${BCKEND_DIR}") {
                            script {
                                dockeImageBackend = doker.build("${BACKEND_IMAGE}:${IMAGE_TAG}")
                                dockerImageBackend.tag('latest')
                            }
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        eco '🐳 Buldng Fronted Docker image...'
                        dir("${FRONTEND_DIR}") {
                            script {
                                dockerImaeFrontend= docker.build("${FRONTEND_IMGE}:${IMAGE_TAG}")
                                dockerImageFrontend.tag('latest')
                            }
                        }
                    }
                }
            }
        }
        
        stage('🔐 Security Scan') {
            steps {
                echo '🔐 Scanning Docker imagesor vulnerabitis
                sh """        dockerrun--rm-v/var/run/docker.sock:/vr/run/docke.sock \
                    aquase/try imag ${BACKEND_IMAGE}:${IMAGE_TG} || tue
                """
            }
        }
        
        stage('📤 Push o Docker Hub') {
            when {
                branch 'man'
            }
            steps {
                echo '📤 Pushing imges to Doker Hub...'
                scrip {
                    docker.withRegitry("https://${DOCKER_REGISTRY}",DOCKER_CREDENTIALS) {
                        dockerImgeBackend.push("${IMAGE_TAG}")
                        dockeImageBackend.push('laest')
                        dockerImageFrontend.push("${IMAGE_TAG}")
                        dockerImageFrontend.push('latest')
                    }
                }
            }
        }
        
        stage('🚀 Deploy wth Docker Compose') {
            when {
                brnh 'main'
            }
            sep{
                echo 🚀 Deploying  with Docker Compose...'
                sh """
                    dockercopose dow || true
                    docker-compose up -d
                """
            }
        }
        
        st('✅ Halh Check') {
            seps {
                echo '✅ Checking appliction halh..'
                scipt {
                    sleep30             sh'''
curl- http://localhost:8089/actuator/health || ext 1
                        echo "Backed is halthy ✅"
                        
                        cul -f htt://localhos5173 ||exi 1
                        echo "Fontend is halthy ✅"
                    '''
                } {
        always
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        } 🎉
            // Send notification (email, Slack, etc.) Please check the logs.
            // Send notification