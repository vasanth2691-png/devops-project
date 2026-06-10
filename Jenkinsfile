pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    IMAGE_NAME = 'devops-sample-api'
    IMAGE_TAG = "jenkins-${env.BUILD_NUMBER}"
    DOCKER_AVAILABLE = 'false'
    DEPLOY_NAMESPACE = 'devops-sample'
    DEPLOYMENT_NAME = 'api'
    CONTAINER_NAME = 'api'
    KIND_CLUSTER = 'devops-sample'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup Node Runtime') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e
              NODE_DIR="$WORKSPACE/.tools/node-v20"
              if [ ! -x "$NODE_DIR/bin/node" ]; then
                mkdir -p "$WORKSPACE/.tools"
                NODE_TARBALL=$(curl -fsSL https://nodejs.org/dist/latest-v20.x/SHASUMS256.txt | awk '/linux-x64.tar.gz$/ {print $2}')
                curl -fsSL "https://nodejs.org/dist/latest-v20.x/$NODE_TARBALL" -o "$WORKSPACE/.tools/node.tar.gz"
                tar -xzf "$WORKSPACE/.tools/node.tar.gz" -C "$WORKSPACE/.tools"
                EXTRACTED_DIR=$(tar -tzf "$WORKSPACE/.tools/node.tar.gz" | head -1 | cut -d/ -f1)
                mv "$WORKSPACE/.tools/$EXTRACTED_DIR" "$NODE_DIR"
              fi
            '''
          }
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          if (isUnix()) {
            withEnv(["PATH+NODE=${WORKSPACE}/.tools/node-v20/bin"]) {
              dir('app') {
                sh 'node --version'
                sh 'npm ci'
              }
            }
          } else {
            dir('app') {
              bat 'npm.cmd ci'
            }
          }
        }
      }
    }

    stage('Run Tests') {
      steps {
        script {
          if (isUnix()) {
            withEnv(["PATH+NODE=${WORKSPACE}/.tools/node-v20/bin"]) {
              dir('app') {
                sh 'npm test'
              }
            }
          } else {
            dir('app') {
              bat 'npm.cmd test'
            }
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          if (isUnix()) {
            def dockerPresent = sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true) == 0
            if (dockerPresent) {
              sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
              env.DOCKER_AVAILABLE = 'true'
            } else {
              echo 'Docker CLI is not available on this Jenkins agent. Skipping image build stage.'
            }
          } else {
            def dockerPresent = bat(script: 'where docker', returnStatus: true) == 0
            if (dockerPresent) {
              bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% .'
              env.DOCKER_AVAILABLE = 'true'
            } else {
              echo 'Docker CLI is not available on this Jenkins agent. Skipping image build stage.'
            }
          }
        }
      }
    }

    stage('Optional Push') {
      when {
        expression { return env.DOCKER_AVAILABLE == 'true' && env.DOCKERHUB_REPO?.trim() }
      }
      steps {
        script {
          def fullImage = "${env.DOCKERHUB_REPO}:${env.IMAGE_TAG}"
          if (isUnix()) {
            sh "docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${fullImage}"
            sh "docker push ${fullImage}"
          } else {
            bat "docker tag %IMAGE_NAME%:%IMAGE_TAG% ${fullImage}"
            bat "docker push ${fullImage}"
          }
        }
      }
    }

    stage('Deploy To kind') {
      steps {
        script {
          if (env.DOCKER_AVAILABLE != 'true') {
            echo 'Docker image was not built on this agent. Skipping deploy stage.'
            return
          }

          if (isUnix()) {
            def kindPresent = sh(script: 'command -v kind >/dev/null 2>&1', returnStatus: true) == 0
            def kubectlPresent = sh(script: 'command -v kubectl >/dev/null 2>&1', returnStatus: true) == 0

            if (!kindPresent || !kubectlPresent) {
              echo 'kind and/or kubectl are not available on this Jenkins agent. Skipping deploy stage.'
              return
            }

            def fullImage = "${env.IMAGE_NAME}:${env.IMAGE_TAG}"
            sh "kind load docker-image ${fullImage} --name ${env.KIND_CLUSTER}"
            sh "kubectl set image deployment/${env.DEPLOYMENT_NAME} ${env.CONTAINER_NAME}=${fullImage} -n ${env.DEPLOY_NAMESPACE}"
            sh "kubectl rollout status deployment/${env.DEPLOYMENT_NAME} -n ${env.DEPLOY_NAMESPACE} --timeout=180s"
          } else {
            echo 'Deploy stage currently configured for Linux Jenkins agent. Skipping on Windows agent.'
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed. Check stage logs for details.'
    }
  }
}
