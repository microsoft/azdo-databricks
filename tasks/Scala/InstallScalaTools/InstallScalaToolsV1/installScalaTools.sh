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
setupJava() {

    # - Java
    echo "sudo apt-get update"
    sudo apt-get update -y
    echo "sudo apt-get install default-jdk"
    sudo apt-get install default-jdk -y
}
setupScalaAndSbt() {

    # - Scala
    echo "sudo apt-get remove scala-library scala"
    sudo apt-get remove scala-library scala -y
    echo "sudo wget http://scala-lang.org/files/archive/scala-2.12.1.deb"
    sudo wget http://scala-lang.org/files/archive/scala-2.12.1.deb
    echo "sudo dpkg -i scala-2.12.1.deb"
    sudo dpkg -i scala-2.12.1.deb
    echo "sudo apt-get update"
    sudo apt-get update -y
    echo "sudo apt-get install scala"
    sudo apt-get install scala -y
    echo "==================="
    echo "sudo apt-get update"
    echo "==================="
    sudo apt-get update -y

    echo "==================="
    echo "sudo apt-get install -y apt-transport-https"
    echo "==================="
    sudo apt-get install -y apt-transport-https -y

    echo "==================="
    echo "echo deb..."
    echo "==================="
    echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list

    echo "==================="
    echo "echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list"
    echo "==================="
    echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list

    echo "==================="
    echo "sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823"
    echo "==================="
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823

    echo "==================="
    echo "sudo apt-get update"
    echo "==================="
    sudo apt-get update -y

    echo "==================="
    echo "sudo apt-get install -y sbt"
    echo "==================="
    sudo apt-get install -y sbt -y

}
#================================================
# Main
#================================================

# As it runs on a non interactive session, it must be explicitly specified.
echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

setupJava
setupScalaAndSbt