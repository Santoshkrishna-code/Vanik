REGIONS="us-east-1 eu-central-1 ap-southeast-1 us-west-1 eu-west-1 eu-west-2 ap-northeast-1 ap-south-1"
for r in $REGIONS; do
  echo "Testing $r..."
  export DATABASE_URL="postgresql://postgres.xesfvipopepjwztmpuye:%40Santosh%242005@aws-0-$r.pooler.supabase.com:6543/postgres?pgbouncer=true"
  export DIRECT_URL="postgresql://postgres.xesfvipopepjwztmpuye:%40Santosh%242005@aws-0-$r.pooler.supabase.com:5432/postgres"
  npx prisma db pull > out.log 2>&1
  if ! grep -q "tenant/user postgres.xesfvipopepjwztmpuye not found" out.log; then
    echo "Found region: $r"
    cat out.log
    exit 0
  fi
done
echo "Not found in common regions."
