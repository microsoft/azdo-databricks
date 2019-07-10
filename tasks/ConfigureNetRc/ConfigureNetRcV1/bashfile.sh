#!/bin/bash
$DATABRICKS_HOST="$1"
$DATABRICKS_TOKEN="$2"

mydata=`echo $DATABRICKS_HOST | cut -c 9-`
    
cat > ~/.netrc << EOF
machine $mydata
login token
password $DATABRICKS_TOKEN
EOF

echo "host = "$DATABRICKS_HOST

cat ~/.netrc