pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    IMAGE_NAME = 'devops-sample-api'
    IMAGE_TAG = "jenkins-${env.BUILD_NUMBER}"
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
                curl -fsSL https://nodejs.org/dist/latest-v20.x/node-v20.19.2-linux-x64.tar.xz -o "$WORKSPACE/.tools/node.tar.xz"
                tar -xJf "$WORKSPACE/.tools/node.tar.xz" -C "$WORKSPACE/.tools"
                mv "$WORKSPACE/.tools/node-v20.19.2-linux-x64" "$NODE_DIR"
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
            sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
          } else {
            bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% .'
          }
        }
      }
    }

    stage('Optional Push') {
      when {
        expression { return env.DOCKERHUB_REPO?.trim() }
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
