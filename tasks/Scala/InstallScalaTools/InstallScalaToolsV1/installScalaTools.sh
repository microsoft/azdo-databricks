#!/bin/bash
# ===================================================================================
#
# FILE:  1-install-java-scala-sbt.sh
#
# USAGE:  1-install-java-scala-sbt.sh
#
#   DESCRIPTION: Installs Java, Scala, and the Scala Build Tool (SBT).
#
# NOTES:  ---
# AUTHOR:  Bruno Terkaly
# VERSION:  1.0
# CREATED:  June 10, 2019
#===================================================================================
prepareToInstall() {
    echo "==================="
    echo "sudo apt-get remove unscd"
    echo "==================="

    sudo apt-get remove unscd -y
    
    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-get update"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
    
    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-get install apt-transport-https -y"
    echo "==================="
    sudo DEBIAN_FRONTEND=noninteractive apt-get software-properties-common install apt-transport-https -y
}

setupJava() {

    # - Java
    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-get install default-jdk"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive apt-get install default-jdk -y
}

installDebianInstaller() {
    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive wget http://scala-lang.org/files/archive/scala-2.12.6.deb"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive wget http://scala-lang.org/files/archive/scala-2.12.6.deb
    
    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive dpkg -i scala-2.12.6.deb"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive dpkg -i scala-2.12.6.deb
}

installScala() {
    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-get update"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive apt-get update -y

    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-get install scala"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive apt-get install scala -y
}

installSbt() {
    echo "==================="
    echo "echo deb..."
    echo "==================="
    
    echo "deb https://dl.bintray.com/sbt/debian /" | sudo DEBIAN_FRONTEND=noninteractive tee -a /etc/apt/sources.list.d/sbt.list

    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823"
    echo "==================="
    
    sudo DEBIAN_FRONTEND=noninteractive apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823

    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-get update"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive apt-get update -y

    echo "==================="
    echo "sudo DEBIAN_FRONTEND=noninteractive apt-get install sbt -y"
    echo "==================="

    sudo DEBIAN_FRONTEND=noninteractive apt-get install sbt -y
}
#================================================
# Main
#================================================
prepareToInstall
setupJava
installDebianInstaller
installScala
installSbt