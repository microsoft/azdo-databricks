echo "Adding SBT to PATH"

if [[ ":$PATH:" == *":/home/vsts/spark-2.4.3-bin-hadoop2.7/bin:"* ]]; then
  echo "SBT already present on PATH"
else
  echo "SBT still not present on PATH. Adding..."
  PATH=$PATH:/home/vsts/spark-2.4.3-bin-hadoop2.7/bin
fi

echo "SBT Test"
PATH=$PATH:/home/vsts/spark-2.4.3-bin-hadoop2.7/bin

echo "sbt test"
sudo sbt -v test