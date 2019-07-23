additionalparams=$1
echo "Adding SBT to PATH"

if [[ ":$PATH:" == *":/home/vsts/spark-2.4.3-bin-hadoop2.7/bin:"* ]]; then
  echo "SBT already present on PATH"
else
  echo "SBT still not present on PATH. Adding..."
  PATH=$PATH:/home/vsts/spark-2.4.3-bin-hadoop2.7/bin
fi

echo "sbt test"

if [ "additionalparams" == "" ]
then
  sudo sbt -v test
else
  sudo sbt $additionalparams -v test
fi