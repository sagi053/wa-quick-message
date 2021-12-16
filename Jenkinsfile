// #!/usr/bin/env groovy
def downloadEnv(envName) {
    echo "downloading ENV file"
    configPath = envName + "/account-admin-v2-frontend/"
    echo configPath
    withAWS(region:'us-east-1', credentials: '{{UUID}}') {
        s3Download(file: "./.env", bucket: 'sdi-config-files', path: configPath + ".env.${envName}", force: true)
    }
}


properties([
    parameters([
        choice(name: 'BRANCH', choices: ['dev','stg','master'].join('\n'),description:'choose branch for deploy')
    ])
])

def BRANCH = "${params.BRANCH}"
def NODE_ENV = 'dev'
if(BRANCH == 'dev'){ NODE_ENV = 'dev' }
if(BRANCH == 'stg'){ NODE_ENV = 'stg' }
if(BRANCH == 'master'){ NODE_ENV = 'prod' }
echo "BRANCH = ${BRANCH}\n"
echo "NODE_ENV = ${NODE_ENV}\n"
pipeline {
    agent{ 
        node {
                label 'SSHSpotLinux'
            }
    } 
    stages {
      stage("Download .env file") {
                  steps {
                      script {
                          downloadEnv(NODE_ENV)
                          sh "ls -lat"
                          sh "cat .env"
                      }
                  }
        }
        stage('run docker')  {
            steps {
                script {
                    docker.withRegistry("https://189007606548.dkr.ecr.us-east-1.amazonaws.com", "ecr:us-east-1:{{UUID}}") {
                        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: '{{UUID}}', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                            def customImage = docker.build("accounts-admin-v2", "-f Dockerfile .")
                            customImage.push()
                            sh "aws eks --region us-east-1 update-kubeconfig --name sdi-${NODE_ENV}-v1"
                            sh "kubectl rollout restart deployment accounts-admin-v2-chart -n ${NODE_ENV}"
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
        success {
            httpRequest (consoleLogResponseBody: true,
                    contentType: 'APPLICATION_JSON',
                    httpMode: 'POST',
                    requestBody: "{\"text\": \"Account Admin V2 was uploaded to s3\"}",
                    url: "{SLACK_URL}",
                    validResponseCodes: '200')
        }
        failure {                
            httpRequest (consoleLogResponseBody: true,
                contentType: 'APPLICATION_JSON',
                httpMode: 'POST',
                requestBody: "{\"text\":\"Account Admin V2 failed to finish\"}",
                url: "{SLACK_URL}",
                validResponseCodes: '200')
        }  
    }
}