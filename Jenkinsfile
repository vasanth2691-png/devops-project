pipeline {
  agent any

  tools {
    nodejs 'node20'
  }

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

    stage('Install Dependencies') {
      steps {
        dir('app') {
          sh 'npm ci'
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir('app') {
          sh 'npm test'
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
